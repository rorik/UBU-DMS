import { Injectable } from '@angular/core';
import { ApiServerService, ApiConnection } from '../api-server';
import { SocketIoModule, SocketIoConfig, Socket } from 'ngx-socket-io';

@Injectable({
    providedIn: 'root'
})
export class HubServerService extends ApiServerService {

    public socket: Socket;

    public set ApiConnection(api: ApiConnection) {
        super.ApiConnection = api;
        if (this.socket) {
            try {
                this.socket.removeAllListeners();
                this.socket.disconnect();
            } catch { }
        }
        this.socket = new Socket({ url: api.url });
    }

    public loginSocket(token: string) {
        this.socket.emit('login', token);
    }

    public async servers(token: string): Promise<GameServer[]> {
        const response = await this.api.get<GameServer[]>(`/server?token=${token}`);
        if (response.ok && response.body) {
            this.validRequest();
            return response.body;
        }
        return null;
    }

    public async deleteServer(token: string, server: GameServer | string): Promise<boolean> {
        const body = new FormData();
        body.append('token', token);
        body.append('name', typeof (server) === 'string' ? server : server.name);
        const response = await this.api.postText('/server/unregister', body);
        if (response.ok && response.body && response.body === 'OK') {
            this.validRequest();
            return true;
        }
        return false;
    }

    public async createServer(token: string, server: GameServer): Promise<boolean> {
        const body = new FormData();
        body.append('token', token);
        body.append('name', server.name);
        body.append('host', server.host);
        body.append('port', server.port);
        const response = await this.api.postText('/server/register', body);
        if (response.ok && response.body && response.body === 'OK') {
            this.validRequest();
            return true;
        }
        return false;
    }
}
export class GameServer {
    name: string;
    host: string;
    port: string;
    owner: string;
}
