import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ChartsModule } from 'ng2-charts';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { SecureComponent } from './secure.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { ServerListComponent } from './server-list/server-list.component';
import { UserComponent } from './user/user.component';
import { RankingsComponent } from './rankings/rankings.component';
import { PlayComponent } from './play/play.component';



@NgModule({
  declarations: [SecureComponent, HeaderComponent, HomeComponent, ServerListComponent, UserComponent, RankingsComponent, PlayComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    FontAwesomeModule,
    ChartsModule,
    ModalModule.forRoot(),
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
  ]
})
export class SecureModule { }
