import { Injectable, EventEmitter } from '@angular/core';
import { ApiServerService, ApiConnection } from '../api-server';
import { Socket } from 'ngx-socket-io';
import { AuthService } from 'src/app/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class HubServerService extends ApiServerService {

    private socket: Socket;

    public readonly chatMessageReceived: EventEmitter<ChatMessage> = new EventEmitter<ChatMessage>();

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

    public async deleteServer(server: GameServer): Promise<boolean> {
        const body = new FormData();
        body.append('token', this.auth.token);
        body.append('name', server.name);
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

    public async joinServer(server: string): Promise<GameServer> {
        const body = new FormData();
        body.append('token', this.auth.token);
        body.append('client', this.socket.ioSocket.id);
        body.append('server', server);
        const response = await this.api.post<GameServer>('/server/join', body);
        if (response.ok && response.body && response.body) {
            this.validRequest();
            return response.body;
        }
        return null;
    }

    public leaveServer(server: string): void {
        this.socket.emit('leave', server);
    }

    public sendChatMessage(server: string, message: string): void {
        this.socket.emit('chat', {server, message});
    }


    private initSocketListeners(): void {
        this.socket.on('chat_message', (msg: ChatMessage) => {
            msg.time *= 1000;
            this.chatMessageReceived.emit(msg);
        });
        this.socket.on('send_chat_res', (res: SocketResponse) => this.handleResponse('send_chat_res', res));
        this.socket.on('join_server_res', (res: SocketResponse) => this.handleResponse('join_server_res', res));
        this.socket.on('login_res', (res: SocketResponse) => this.handleResponse('login_res', res));
    }

    private loginSocket(token: string): void {
        this.socket.emit('login', token);
    }

    private handleResponse(event: string, response: SocketResponse): void {
        if (!response.ok) {
            console.error(event, response);
            if (response.error === 'not_authenticated') {
                this.loginSocket(this.auth.token);
            }
        }
    }
}

export interface GameServer {
    name: string;
    host: string;
    port: string;
    owner: string;
}

export interface ChatMessage {
    user: string;
    time: number;
    message: string;
    server: string;
}

interface SocketResponse {
    ok: boolean;
    error?: string;
}
