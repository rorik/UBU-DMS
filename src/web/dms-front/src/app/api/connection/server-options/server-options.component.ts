import { Component, TemplateRef, ViewChild } from '@angular/core';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ApiConnectionService } from '../api-connection.service';
import { ApiConnection } from '../../api-server';

@Component({
    selector: 'app-server-options',
    templateUrl: './server-options.component.html',
    styleUrls: ['./server-options.component.scss']
})
export class ServerOptionsComponent {

    public readonly reloadIcon = faSyncAlt;
    public readonly servers: ExtendedApiConnection[] = [];
    public modalRef: BsModalRef;
    public edit: { server: ExtendedApiConnection, url: string, name: string, persist: boolean };

    @ViewChild('editTemplate', { static: true }) private editTemplate: TemplateRef<any>;

    constructor(private api: ApiConnectionService, private modalService: BsModalService) {
        this.servers = this.api.servers.map((server: ExtendedApiConnection) => server);
    }

    public reloadServer(server: ExtendedApiConnection): void {
        if (!server.reloading) {
            server.reloading = true;
            this.api.refreshStatus(server).then(() => {
                server.reloading = false;
            });
        }
    }

    public editServer(server: ExtendedApiConnection): void {
        if (!server.reloading) {
            this.edit = { server, url: server.url, name: server.name, persist: true };
            this.modalRef = this.modalService.show(this.editTemplate);
        }
    }

    public cancelEdit(): void {
        this.modalRef.hide();
        this.edit.server = undefined;
    }

    public saveEdit(): void {
        this.modalRef.hide();
        const newServer = this.api.changeServerUrl(this.edit.server.service, this.edit.url) as ExtendedApiConnection;
        if (this.edit.persist) {
            this.api.persistServerUrl(newServer);
        }
        this.servers[this.servers.indexOf(this.edit.server)] = newServer;
        this.edit.server = undefined;
        this.reloadServer(newServer);
    }
}

class ExtendedApiConnection extends ApiConnection {
    public reloading = false;
}
