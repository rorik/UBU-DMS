import { HttpResponse, HttpParams, HttpClient, HttpErrorResponse } from '@angular/common/http';

export abstract class ApiServerService {
    protected api: ApiConnection;
    public set ApiConnection(api: ApiConnection) {
        this.api = api;
    }
    public readonly statusUrl = '';
    public readonly statusValidator: (response: HttpResponse<string>) => boolean = (res) => res.ok;
    protected validRequest() {
        this.api.status = true;
    }
}

export class ApiConnection {
    constructor(
            private http: HttpClient,
            public url: string,
            public readonly service: ApiServerService,
            public readonly name: string,
            public status: boolean = false) {
        service.ApiConnection = this;
    }
    public get<T>(url: string, params?: HttpParams | { [param: string]: string | string[]; }): Promise<HttpResponse<T>> {
        return this.http.get<T>(this.url + url, { observe: 'response', params })
            .toPromise()
            .catch(err => this.responseFromError<T>(err));
    }
    public getText(url: string, params?: HttpParams | { [param: string]: string | string[]; }): Promise<HttpResponse<string>> {
        return this.http.get(this.url + url, { observe: 'response', params, responseType: 'text' })
            .toPromise()
            .catch(err => this.responseFromError<string>(err));
    }
    public post<T>(url: string, body: any, params?: HttpParams | { [param: string]: string | string[]; }): Promise<HttpResponse<T>> {
        return this.http.post<T>(this.url + url, body, { observe: 'response', params })
            .toPromise()
            .catch(err => this.responseFromError<T>(err));
    }
    public postText(url: string, body: any, params?: HttpParams | { [param: string]: string | string[]; }): Promise<HttpResponse<string>> {
        return this.http.post(this.url + url, body, { observe: 'response', params, responseType: 'text' })
            .toPromise()
            .catch(err => this.responseFromError<string>(err));
    }
    private responseFromError<T>(error: HttpErrorResponse): HttpResponse<T> {
        const response = new HttpResponse<T>({
            body: null,
            status: 'status' in error && error.status ? error.status : 400,
            url: error.url,
            headers: error.headers,
            statusText: error.statusText
        });
        return response;
    }
}
