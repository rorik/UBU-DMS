
import { Injectable } from '@angular/core';
import { ApiServerService } from '../api-server';

@Injectable({
    providedIn: 'root'
})
export class AuthServerService extends ApiServerService {

    public async login(username: string, password: string): Promise<{ token?: string, errorCode?: number }> {
        const body = new FormData();
        body.append('username', username);
        body.append('password', password);
        const response = await this.api.postText('/user/login', body);
        if (!response.ok) {
            let data = response.body;
            if (!data || data.length === 0) {
                data = response.statusText;
            }
            return { token: `${response.status} - ${data}`, errorCode: response.status };
        }
        if (!response.body || response.body.length === 0) {
            return { token: 'The auth server returned an invalid response', errorCode: response.status };
        }
        this.validRequest();
        return { token: response.body };
    }

    public async checkToken(token: string): Promise<boolean> {
        const response = await this.api.getText('/token/check', { token });
        if (response.ok && response.body) {
            this.validRequest();
            return true;
        }
        return false;
    }

    public async signup(username: string, password: string): Promise<{ code: number, text: string }> {
        const body = new FormData();
        body.append('username', username);
        body.append('password', password);
        const response = await this.api.postText('/user/create', body);
        if (!response.ok) {
            let data = response.body;
            if (!data || data.length === 0) {
                data = response.statusText;
            }
            return { code: response.status, text: `${response.status} - ${data}` };
        }
        if (!response.body || response.body.length === 0) {
            return { code: response.status, text: 'The auth server returned an invalid response' };
        }
        this.validRequest();
        return null;
    }

    public async userInfo(token: string): Promise<UserInfo> {
        const response = await this.api.get<UserInfoResponse>(`/user/info?token=${token}`);
        if (response.ok && response.body) {
            this.validRequest();
            return new UserInfo(response.body);
        }
        return null;
    }

    public async usernameInfo(username: string): Promise<UserInfo> {
        const response = await this.api.get<UserInfoResponse>(`/user/info?username=${username}`);
        if (response.ok && response.body) {
            this.validRequest();
            return new UserInfo(response.body);
        }
        return null;
    }


    public async users(): Promise<UserInfo[]> {
        const response = await this.api.get<UserInfoResponse[]>('/score');
        if (response.ok && response.body) {
            this.validRequest();
            return response.body.map(user => new UserInfo(user));
        }
        return null;
    }
}
export class UserInfo {
    constructor(userInfo: UserInfoResponse) {
        this.username = userInfo.username;
        this.gamesWon = userInfo.games_won;
        this.gamesLost = userInfo.games_lost;
        this.score = userInfo.score;
    }
    public username: string;
    public gamesWon: number;
    public gamesLost: number;
    public score: number;
}
class UserInfoResponse {
    constructor(userInfo: UserInfo) {
        this.username = userInfo.username;
        this.games_won = userInfo.gamesWon;
        this.games_lost = userInfo.gamesLost;
        this.score = userInfo.score;
    }
    username: string;
    // tslint:disable-next-line:variable-name
    games_won: number;
    // tslint:disable-next-line:variable-name
    games_lost: number;
    score: number;
}

