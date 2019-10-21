import { Injectable } from '@angular/core';
import { ApiServerService, ApiConnection } from '../api-server';
import { Socket } from 'ngx-socket-io';
import { AuthService } from 'src/app/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class HubServerService extends ApiServerService {

    public socket: Socket;

    public set apiConnection(api: ApiConnection) {
        super.apiConnection = api;
        if (this.socket) {
            try {
                this.socket.removeAllListeners();
                this.socket.disconnect();
            } catch { }
        }
        this.socket = new Socket({ url: api.url });
        if (this.auth.token) {
            this.loginSocket(this.auth.token);
        }
        this.initSocketListeners();
    }

    constructor(private auth: AuthService) {
        super();
        this.auth.tokenChange.subscribe((token: string) => this.loginSocket(token));
    }

    public async servers(): Promise<GameServer[]> {
        const response = await this.api.get<GameServer[]>(`/server?token=${this.auth.token}`);
        if (response.ok && response.body) {
            this.validRequest();
            return response.body;
        }
        return null;
    }

    public async deleteServer(server: GameServer | string): Promise<boolean> {
        const body = new FormData();
        body.append('token', this.auth.token);
        body.append('name', typeof (server) === 'string' ? server : server.name);
        const response = await this.api.postText('/server/unregister', body);
        if (response.ok && response.body && response.body === 'OK') {
            this.validRequest();
            return true;
        }
        return false;
    }

    public async createServer(server: GameServer): Promise<boolean> {
        const body = new FormData();
        body.append('token', this.auth.token);
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

    public async joinServer(server: string): Promise<boolean> {
        const body = new FormData();
        body.append('token', this.auth.token);
        body.append('client', this.socket.ioSocket);
        body.append('server', server);
        const response = await this.api.postText('/server/join', body);
        if (response.ok && response.body && response.body === 'OK') {
            this.validRequest();
            return true;
        }
        return false;
    }

    public sendChatMessage(server: string, message: string): void {
        this.socket.emit('chat', {server, message});
    }

    private initSocketListeners(): void {
        // this.socket.on('connect', () => {
        //     console.warn(this.socket.ioSocket.id, this.socket.ioSocket.io.engine.id, this.socket.ioSocket.json.id);
        // });
    }

    private loginSocket(token: string): void {
        this.socket.emit('login', token);
    }
}
export class GameServer {
    name: string;
    host: string;
    port: string;
    owner: string;
}

export class ChatMessage {
    username: string;
    timestamp: number;
    message: string;
}
