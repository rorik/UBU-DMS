import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from './auth/guard/auth-guard.service';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { SecureComponent } from './secure/secure.component';
import { HomeComponent } from './secure/home/home.component';
import { ServerListComponent } from './secure/server-list/server-list.component';
import { UserComponent } from './secure/user/user.component';
import { RankingsComponent } from './secure/rankings/rankings.component';

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    {
        path: 'secure', component: SecureComponent,
        canActivate: [AuthGuardService],
        children: [
            { path: 'servers', component: ServerListComponent },
            { path: 'user', component: UserComponent },
            { path: 'rankings/:username', component: UserComponent },
            { path: 'rankings', component: RankingsComponent },
            { path: '', component: HomeComponent },
        ]
    },
    {
        path: '**',
        pathMatch: 'full',
        redirectTo: '/secure'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { enableTracing: false })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
