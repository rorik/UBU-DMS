import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AuthModule } from './auth/auth.module';
import { ApiModule } from './api/api.module';
import { SecureModule } from './secure/secure.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        ApiModule,
        AuthModule,
        SecureModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
