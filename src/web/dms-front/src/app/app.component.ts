import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    public debugHidden = false;
    public debug = false;
    private debugTimeout: any;

    public toggleDebug(): void {
        if (this.debugTimeout) {
            clearTimeout(this.debugTimeout);
        }
        if (this.debug) {
            this.debug = false;
            this.debugTimeout = setTimeout(() => this.debugHidden = true, 500);
        } else {
            this.debugHidden = false;
            this.debugTimeout = setTimeout(() => this.debug = true, 20);
        }
    }
}
