import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ApiConnection, ApiServerService } from '../api-server';
import { AuthServerService } from '../auth/auth-server.service';
import { HubServerService } from '../hub/hub-server.service';

@Injectable({
    providedIn: 'root'
})
export class ApiConnectionService {

    constructor(private http: HttpClient, auth: AuthServerService, hub: HubServerService) {
        this.apiConnections = [this.getApiConnection(auth, 'Auth'), this.getApiConnection(hub, 'Hub')];
        this.refreshAllStatus();
    }

    private apiConnections: ApiConnection[];

    public get servers(): ApiConnection[] {
        return this.apiConnections.map(api => api);
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

    public changeServerUrl(service: ApiServerService, url: string): ApiConnection {
        const apiConnectionIndex = this.apiConnections.findIndex(api => api.service === service);
        if (apiConnectionIndex !== -1) {
            this.apiConnections[apiConnectionIndex] = new ApiConnection(this.http, url, service, this.apiConnections[apiConnectionIndex].name);
            service.apiConnection = this.apiConnections[apiConnectionIndex];
            return this.apiConnections[apiConnectionIndex];
        }
        return null;
    }

    private getApiConnection(server: ApiServerService, name: string): ApiConnection {
        let url = localStorage.getItem(`url_${name}`);
        if (!url || url.length === 0) {
            url = environment.api[name.toLowerCase()];
            if (!url || url.length === 0) {
                url = 'http://localhost:1000';
            }
        }
        return new ApiConnection(this.http, url, server, name);
    }
}

