import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServerOptionsComponent } from './connection/server-options/server-options.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
    declarations: [ServerOptionsComponent],
    imports: [
        CommonModule,
        FormsModule,
        FontAwesomeModule,
        ModalModule.forRoot(),
    ],
    exports: [ServerOptionsComponent]
})
export class ApiModule { }
