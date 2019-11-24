import { HttpClient, HttpClientResponse } from 'typed-rest-client/HttpClient';
import { SerializedBoard } from './models/board';
import { SerializedCell, ICell } from './models/cell';
import { Boat } from './models/boat';

export class RestClient {
    
    private static readonly client: HttpClient = new HttpClient('dms-game-client');
    private static clientId: string;
    private static url: string;

    constructor(url?: string) {
        if (url) {
            if (!url.startsWith('http')) {
                url = `http://${url}`;
            }
            this.serverUrl = url;
        } else if (!this.serverUrl) {
            this.serverUrl = 'http://localhost:2222';
        }
    }

    public get serverUrl(): string {
        return RestClient.url;
    }
    public set serverUrl(url: string) {
        RestClient.url = url;
    }

    public async checkConnection(): Promise<boolean> {
        return (await this.get('/')).ok;
    }

    /** Game specific methods */

    public async join(token: string): Promise<boolean> {
        const response = await this.postRaw('/join', { token });

        const validResponse = response.ok && !!response.body;
        if (validResponse) {
            RestClient.clientId = response.body;
        }
        return validResponse;
    }

    public async attack(cell: ICell): Promise<AttackReponse> {
        const response = await this.put<AttackReponse>('/play/attack', { x: cell.x, y: cell.y, clientId: RestClient.clientId })
        return response.ok && response.body ? response.body : null;
    }

    public async getStatus(): Promise<StatusReponse> {
        const response = await this.put<StatusReponse>('/play/status', { clientId: RestClient.clientId })
        return response.ok && response.body ? response.body : null;
    }

    public async getStatusBrief(): Promise<StatusReponse> {
        const response = await this.put<StatusReponse>('/play/status/brief', { clientId: RestClient.clientId })
        return response.ok && response.body ? response.body : null;
    }

    /** HTTP Methods */

    private async get<T>(url: string): Promise<HttpResponse<T>> {
        try {
            const response = await RestClient.client.get(this.normalizeUrl(url));
            const bodySerialized = await response.readBody();
            return { response, body: JSON.parse(bodySerialized) as T, statusCode: response.message.statusCode, ok: this.ok(response) }
        } catch (error) {
            return { response: undefined, body: undefined, statusCode: 0, ok: false };
        }
    }

    private async post<T>(url: string, body: any): Promise<HttpResponse<T>> {
        const result = await this.postRaw(url, body);
        return { response: result.response, body: result.body ? JSON.parse(result.body) : undefined, statusCode: result.statusCode, ok: result.ok };
    }

    private async postRaw(url: string, body: any): Promise<HttpResponse<string>> {
        try {
            const response = await RestClient.client.post(this.normalizeUrl(url), JSON.stringify(body), { 'Content-Type': 'application/json' });
            const bodySerialized = await response.readBody();
            return { response, body: bodySerialized, statusCode: response.message.statusCode, ok: this.ok(response) }
        } catch (error) {
            return { response: undefined, body: undefined, statusCode: 0, ok: false };
        }
    }

    private async put<T>(url: string, body: any): Promise<HttpResponse<T>> {
        try {
            const response = await RestClient.client.put(this.normalizeUrl(url), JSON.stringify(body), { 'Content-Type': 'application/json' });
            const bodySerialized = await response.readBody();
            return { response, body: JSON.parse(bodySerialized) as T, statusCode: response.message.statusCode, ok: this.ok(response) }
        } catch (error) {
            return { response: undefined, body: undefined, statusCode: 0, ok: false };
        }
    }

    private ok(request: HttpClientResponse): boolean {
        return request && request.message.statusCode >= 200 && request.message.statusCode < 300;
    }

    private normalizeUrl(url: string): string {
        return `${this.serverUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    }
}

export interface StatusReponse {
    self: UserStatus;
    oponent: UserStatus;
    boats: Boat[];
    turn: boolean;
    gameover: boolean;
    player: boolean;
    started: boolean;
    winner: boolean;
}

export interface AttackReponse {
    cell: SerializedCell;
    boat?: Boat;
}

export interface UserStatus {
    board: SerializedBoard;
    username: string;
    lastMove: AttackReponse;
}

interface HttpResponse<T> {
    response: HttpClientResponse;
    body: T;
    statusCode: number;
    ok: boolean;
}
