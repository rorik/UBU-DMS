import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { UserInfo } from 'src/app/api/auth/auth-server.service';
import { ChartOptions } from 'chart.js';
import { Color } from 'ng2-charts';
import { ActivatedRoute } from '@angular/router';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})
export class UserComponent {

    public error = false;
    public reloading = false;
    public readonly reloadIcon = faSyncAlt;
    public userInfo: UserInfo = { username: 'loading...', gamesWon: 0, gamesLost: 0, score: 0 };
    public ratio: string;

    public chartData: number[] = [0, 0];
    public chartColors: Color[] = [
        {
            backgroundColor: [
                '#17A2B8',
                '#6C757D'
            ]
        }
    ];
    public chartOptions: ChartOptions = { responsive: true, maintainAspectRatio: false };

    private username: string;

    constructor(private auth: AuthService, route: ActivatedRoute) {
        route.paramMap.subscribe(params => {
            this.username = params.get('username');
            this.reload();
        });
    }

    private reload(): void {
        if (!this.reloading) {
            this.reloading = true;
            this.auth.userInfo(this.username).then(userInfo => {
                if (userInfo) {
                    this.userInfo = userInfo;
                    this.chartData = [userInfo.gamesWon, userInfo.gamesLost];
                    this.ratio = (userInfo.gamesWon / Math.max(userInfo.gamesLost + userInfo.gamesWon, 1) * 100).toFixed(1);
                } else {
                    this.error = true;
                }
                this.reloading = false;
            });
        }
    }

}
