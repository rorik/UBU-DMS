import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HubServerService } from 'src/app/api/hub/hub-server.service';

@Component({
    selector: 'app-play',
    templateUrl: './play.component.html',
    styleUrls: ['./play.component.scss']
})
export class PlayComponent implements OnInit {

    public server: string;

    constructor(private hub: HubServerService, private route: ActivatedRoute) {

    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.server = params.get('server');
        });
    }

    public send() {

    }

}
