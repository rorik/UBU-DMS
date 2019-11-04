import { HttpClient, HttpClientResponse } from 'typed-rest-client/HttpClient';
import { SerializedBoard } from './models/board';
import { SerializedCell, ICell } from './models/cell';
import { Boat } from './models/boat';

export class RestClient {

    private static client: HttpClient = new HttpClient('dms-game-client');
    private static clientId: string;
    private static url: string;

    constructor(url?: string) {
        if (url) {
            this.setUrl(url);
        } else if (!RestClient.url) {
            this.setUrl('http://localhost:2222');
        }
    }

    public setUrl(url: string): void {
        RestClient.url = url;
    }

    public async checkConnection(): Promise<boolean> {
        return (await this.get('/')).ok;
    }

    /** Game specific methods */

    public async join(token: string): Promise<boolean> {
        const response = await this.post<string>('/join', { token })

        const validResponse = response.ok && !!response.body;
        if (validResponse) {
            RestClient.clientId = response.body;
        }
        return validResponse;
    }

    public async setUp(board: SerializedBoard): Promise<any> {
        const response = await this.post<object>('/play/setup', { board, clientId: RestClient.clientId });
        // TODO
        return response;
    }

    public async attack(cell: ICell): Promise<SerializedCell> {
        const response = await this.put<SerializedCell>('/play/attack', { x: cell.x, y: cell.y, clientId: RestClient.clientId })
        return response.ok && response.body ? response.body : null;
    }


    public async getStatus(): Promise<StatusReponse> {
        const response = await this.put<StatusReponse>('/play/status', { clientId: RestClient.clientId })
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
        try {
            const response = await RestClient.client.post(this.normalizeUrl(url), JSON.stringify(body));
            const bodySerialized = await response.readBody();
            return { response, body: JSON.parse(bodySerialized) as T, statusCode: response.message.statusCode, ok: this.ok(response) }
        } catch (error) {
            return { response: undefined, body: undefined, statusCode: 0, ok: false };
        }
    }

    private async put<T>(url: string, body: any): Promise<HttpResponse<T>> {
        try {
            const response = await RestClient.client.put(this.normalizeUrl(url), JSON.stringify(body));
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
        return `${RestClient.url}${url.startsWith('/') ? '' : '/'}${url}`;
    }

}

export interface StatusReponse {
    selfBoard: SerializedBoard;
    oponentBoard: SerializedBoard;
    boats: Boat[];
}

interface HttpResponse<T> {
    response: HttpClientResponse;
    body: T;
    statusCode: number;
    ok: boolean;
}