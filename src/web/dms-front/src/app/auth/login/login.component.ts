import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {

    public readonly allowedLenghts = {
        username: { min: 3, max: 80 },
        password: { min: 3, max: 256 }
    };

    public readonly loginForm: FormGroup;

    public errors: { serverError?: string, invalidLogin?: boolean, invalidField?: string } = {};

    public loading = false;

    public signedUp = false;

    constructor(private router: Router, private auth: AuthService, formBuilder: FormBuilder) {
        this.loginForm = formBuilder.group({
            username: new FormControl('', [
                Validators.required,
                Validators.minLength(this.allowedLenghts.username.min),
                Validators.maxLength(this.allowedLenghts.username.max)
            ]),
            password: new FormControl('', [
                Validators.required,
                Validators.minLength(this.allowedLenghts.password.min),
                Validators.maxLength(this.allowedLenghts.password.max)
            ]),
            rememberMe: localStorage.getItem('remember_me') === true.toString()
        });
        const extras = this.router.getCurrentNavigation().extras;
        if (extras.state) {
            if (extras.state.logout) {
                this.auth.logout();
            } else if (extras.state.signup) {
                this.signedUp = true;
            }
        }
    }

    public login(): void {
        if (!this.loading) {
            this.loading = true;
            if (this.loginForm.controls.username.invalid) {
                this.errors.invalidField = 'username';
            } else {
                if (this.loginForm.controls.password.invalid) {
                    this.errors.invalidField = 'password';
                } else {
                    this.errors.invalidField = undefined;
                }
            }
            this.errors.invalidLogin = false;
            this.errors.serverError = undefined;
            if (this.loginForm.valid) {
                this.auth.login(this.loginForm.value.username, this.loginForm.value.password, this.loginForm.value.rememberMe).then(result => {
                    if (result.ok) {
                        this.router.navigate(['secure']);
                    } else if (!result.error) {
                        this.errors.invalidLogin = true;
                    } else {
                        this.errors.serverError = result.error;
                    }
                    this.loading = false;
                });
            } else {
                this.loading = false;
            }
        }
    }
}
