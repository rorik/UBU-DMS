import { Component } from '@angular/core';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/auth/auth.service';
import { UserInfo } from 'src/app/api/auth/auth-server.service';

@Component({
    selector: 'app-rankings',
    templateUrl: './rankings.component.html',
    styleUrls: ['./rankings.component.scss']
})
export class RankingsComponent {

    public error = false;
    public reloading = false;
    private allUsers: RankingUserInfo[];
    public users: RankingUserInfo[] = [];

    public readonly reloadIcon = faSyncAlt;

    public availableUsers = 0;
    public currentPage = 1;
    public readonly itemsPerPage = 15;
    private usernameFilter: string;

    constructor(private auth: AuthService) {
        this.reload();
    }

    public async reload(): Promise<void> {
        if (!this.reloading) {
            this.reloading = true;
            const users = await this.auth.users();
            if (users) {
                this.allUsers = users.sort((a, b) => b.score - a.score).map((userInfo: RankingUserInfo) => userInfo);
                this.allUsers.forEach((user, index) => user.position = index + 1);
                this.availableUsers = this.allUsers.length;
                this.changePage(1);
            } else {
                this.error = true;
            }
            this.reloading = false;
        }
    }

    public changePage(page: number): void {
        const users = this.filter().slice(this.itemsPerPage * (page - 1), this.itemsPerPage * page);
        users.filter(user => !user.ratio).forEach(user => user.ratio = (user.gamesWon / Math.max(user.gamesLost + user.gamesWon, 1) * 100).toFixed(1));
        this.users = users;
    }

    public applyFilter(usernameFilter: string): void {
        this.usernameFilter = usernameFilter;
        this.changePage(1);
        this.currentPage = 1;
    }

    private filter(): RankingUserInfo[] {
        if (!this.usernameFilter || this.usernameFilter.length === 0) {
            this.availableUsers = this.allUsers.length;
            return this.allUsers;
        }
        const filter = this.usernameFilter;
        const filtered = this.allUsers.filter(user => user.username.indexOf(filter) !== -1);
        this.availableUsers = filtered.length;
        return filtered;
    }

}

class RankingUserInfo extends UserInfo {
    public position: number;
    public ratio: string;
}
