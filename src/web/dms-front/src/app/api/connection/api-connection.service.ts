import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ApiConnection } from '../api-server';
import { AuthServerService } from '../auth/auth-server.service';
import { HubServerService } from '../hub/hub-server.service';

@Injectable({
    providedIn: 'root'
})
export class ApiConnectionService {

    constructor(private http: HttpClient, auth: AuthServerService, hub: HubServerService) {
        this.authServer = new ApiConnection(this.http, environment.api.auth, auth, 'Auth');
        this.hubServer = new ApiConnection(this.http, environment.api.hub, hub, 'Hub');
        this.servers.forEach(server => {
            const url = localStorage.getItem(`url_${server.name}`);
            if (url && url.length > 0) {
                server.url = url;
            }
        });
        this.refreshAllStatus();
    }

    public readonly authServer: ApiConnection;
    public readonly hubServer: ApiConnection;

    public get servers(): ApiConnection[] {
        return [this.authServer, this.hubServer];
    }

    public refreshAllStatus() {
        this.servers.forEach(this.refreshStatus);
    }

    public async refreshStatus(server: ApiConnection): Promise<boolean> {
        try {
            const response = await server.getText(server.service.statusUrl);
            return server.status = server.service.statusValidator(response);
        } catch (e) {
            return server.status = false;
        }
    }

    public persistServerUrl(server: ApiConnection) {
        localStorage.setItem(`url_${server.name}`, server.url);
    }
}

