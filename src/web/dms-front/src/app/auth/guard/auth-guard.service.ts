import { Injectable } from '@angular/core';
import { CanActivate, Router, CanActivateChild } from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuardService implements CanActivate, CanActivateChild {

    constructor(private auth: AuthService, private router: Router) { }

    public async canActivate(): Promise<boolean> {
        if (!await this.auth.isAuthenticated()) {
            this.router.navigate(['login']);
            return false;
        }
        return true;
    }

    public async canActivateChild(): Promise<boolean> {
        return this.canActivate();
    }
}
