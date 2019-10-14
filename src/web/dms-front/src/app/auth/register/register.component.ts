import { LoginComponent } from './../login/login.component';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

    public readonly allowedLenghts = {
        username: { min: 3, max: 80 },
        password: { min: 3, max: 256 }
    };

    public readonly registerForm: FormGroup;

    public errors: { serverError?: string, usernameTaken?: boolean, invalidField?: string } = {};

    public loading = false;

    constructor(private router: Router, private auth: AuthService, formBuilder: FormBuilder) {
        this.registerForm = formBuilder.group({
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
        });
    }

    public register(): void {
        if (!this.loading) {
            this.loading = true;
            if (this.registerForm.controls.username.invalid) {
                this.errors.invalidField = 'username';
            } else {
                if (this.registerForm.controls.password.invalid) {
                    this.errors.invalidField = 'password';
                } else {
                    this.errors.invalidField = undefined;
                }
            }
            this.errors.usernameTaken = false;
            this.errors.serverError = undefined;
            if (this.registerForm.valid) {
                this.auth.signup(this.registerForm.value.username, this.registerForm.value.password).then(result => {
                    if (result.ok) {
                        this.router.navigate(['/login'], { state: { signup: true } });
                    } else if (!result.error) {
                        this.errors.usernameTaken = true;
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
