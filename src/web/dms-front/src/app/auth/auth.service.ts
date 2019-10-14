import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { AuthServerService, UserInfo } from 'src/app/api/auth/auth-server.service';
import { HubServerService } from 'src/app/api/hub/hub-server.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    // tslint:disable-next-line:variable-name
    private _token: string;
    public get token(): string {
        return this._token;
    }
    // tslint:disable-next-line:variable-name
    private _username: string;
    public get username(): string {
        return this._username;
    }

    constructor(private auth: AuthServerService, private hub: HubServerService) { }

    public async isAuthenticated(): Promise<boolean> {
        if (!this._token) {
            const token = localStorage.getItem('token');
            if (token && localStorage.getItem('remember_me') === true.toString()) {
                if (this.isTokenExpired()) {
                    this.logout();
                } else {
                    const userInfo = await this.auth.userInfo(token);
                    if (!userInfo) {
                        this.logout();
                    } else {
                        this.setToken(token);
                        this._username = userInfo.username;
                        return true;
                    }
                }
            }
        } else if (this.isTokenExpired()) {
            this.logout();
        }
        if (!this._token || this._token.length === 0) {
            return false;
        }
        return await this.auth.checkToken(this._token);
    }

    public async login(username: string, password: string, rememberMe: boolean): Promise<{ ok: boolean, error?: string }> {
        const response = await this.auth.login(username, password);
        if (!response.errorCode) {
            localStorage.setItem('remember_me', rememberMe.toString());
            localStorage.setItem('token', response.token);
            localStorage.setItem('token_exp', moment(new Date()).add(6, 'h').toISOString());
            this.setToken(response.token);
            this._username = username;
            return { ok: true };
        }
        if (response.errorCode === 401) {
            return { ok: false };
        }
        return { ok: false, error: response.token };
    }

    public logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('token_exp');
        this.setToken(undefined);
    }

    public async signup(username: string, password: string): Promise<{ ok: boolean, error?: string }> {
        const error = await this.auth.signup(username, password);
        if (error) {
            if (error.code === 500) {
                return { ok: false };
            }
            return { ok: false, error: error.text };
        }
        return { ok: true };
    }

    public async userInfo(username?: string): Promise<UserInfo> {
        if (username && username.length > 0) {
            return await this.auth.usernameInfo(username);
        }
        return await this.auth.userInfo(this._token);
    }

    public async users(): Promise<UserInfo[]> {
        return await this.auth.users();
    }

    private setToken(token: string) {
        this._token = token;
        this.hub.loginSocket(token);
    }

    private isTokenExpired(): boolean {
        const tokenExp = localStorage.getItem('token_exp');
        return moment(tokenExp).isBefore(moment(new Date()));
    }

}
