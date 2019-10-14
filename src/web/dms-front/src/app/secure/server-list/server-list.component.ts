import { Component, TemplateRef, ViewChild } from '@angular/core';
import { faPlus, faTrashAlt, faEdit, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { HubServerService, GameServer } from 'src/app/api/hub/hub-server.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
    selector: 'app-server-list',
    templateUrl: './server-list.component.html',
    styleUrls: ['./server-list.component.scss']
})
export class ServerListComponent {

    public myServers: GameServer[] = [];
    public publicServers: GameServer[] = [];
    private allMyServers: GameServer[] = [];
    private allPublicServers: GameServer[] = [];

    public readonly createServerIcon = faPlus;
    public readonly deleteServerIcon = faTrashAlt;
    public readonly editServerIcon = faEdit;

    public readonly availableServers: { mine: number, public: number } = { mine: 0, public: 0 };
    public readonly currentPage: { mine: number, public: number } = { mine: 1, public: 1 };
    public readonly itemsPerPage: { mine: number, public: number } = { mine: 4, public: 6 };

    public editingServer: GameServer;
    public serverErrors: { name: boolean, host: boolean, port: boolean, duplicated: boolean };

    public readonly reloadIcon = faSyncAlt;
    public reloading = false;

    @ViewChild('deleteTemplate', { static: true }) private deleteTemplate: TemplateRef<any>;
    @ViewChild('createTemplate', { static: true }) private createTemplate: TemplateRef<any>;
    @ViewChild('editTemplate', { static: true }) private editTemplate: TemplateRef<any>;

    private modalRef: BsModalRef;

    constructor(private hub: HubServerService, private auth: AuthService, private modalService: BsModalService) {
        this.reloadServers();
    }

    public async reloadServers(): Promise<void> {
        this.reloading = true;
        const servers = await this.hub.servers(this.auth.token);
        const username = this.auth.username;
        this.allMyServers = [];
        this.allPublicServers = [];
        servers.forEach(server => (server.owner === username ? this.allMyServers : this.allPublicServers).push(server));
        this.availableServers.mine = this.allMyServers.length;
        this.availableServers.public = this.allPublicServers.length;
        this.changePageMine(1);
        this.changePagePublic(1);
        this.reloading = false;
    }

    public changePageMine(page: number): void {
        this.myServers = this.allMyServers.slice(this.itemsPerPage.mine * (page - 1), this.itemsPerPage.mine * page);
    }

    public changePagePublic(page: number): void {
        this.publicServers = this.allPublicServers.slice(this.itemsPerPage.public * (page - 1), this.itemsPerPage.public * page);
    }

    public deleteServer(server: GameServer): void {
        this.editingServer = server;
        this.modalRef = this.modalService.show(this.deleteTemplate);
    }

    public async confirmDeleteServer(confirm: boolean): Promise<void> {
        this.modalRef.hide();
        const server = this.editingServer;
        if (confirm) {
            const deleted = await this.hub.deleteServer(this.auth.token, server);
            if (deleted) {
                this.allMyServers = this.slice(this.allMyServers, this.allMyServers.indexOf(server));
                const currentIndex = this.myServers.indexOf(server);
                let page = this.currentPage.mine;
                if (currentIndex === this.myServers.length - 1) {
                    page = Math.max(page, 1);
                }
                this.availableServers.mine = this.allMyServers.length;
                this.changePageMine(page);
                this.currentPage.mine = page;
            }
        }
    }

    public editServer(server: GameServer): void {
        this.editingServer = Object.assign({}, server);
        this.serverErrors = { name: false, host: false, port: false, duplicated: false };
        this.modalRef = this.modalService.show(this.editTemplate);
    }

    public async confirmEditServer(confirm: boolean): Promise<void> {
        const server = this.editingServer;
        if (confirm) {
            this.serverErrors.host = !server.host || server.host.length === 0;
            this.serverErrors.port = !server.port || isNaN(+server.port) || +server.port <= 0 || +server.port > 65535;
            if (!this.serverErrors.host && !this.serverErrors.port) {
                this.modalRef.hide();
                const originalServer = this.allMyServers.find(s => s.name === server.name);
                if (originalServer.host !== server.host || originalServer.port !== server.port) {
                    const edited = await this.hub.createServer(this.auth.token, server);
                    if (edited) {
                        originalServer.host = server.host;
                        originalServer.port = server.port;
                    }
                }
            }
        } else {
            this.modalRef.hide();
        }
    }

    public createServer(): void {
        this.editingServer = new GameServer();
        this.serverErrors = { name: false, host: false, port: false, duplicated: false };
        this.modalRef = this.modalService.show(this.createTemplate);
    }

    public async confirmCreateServer(confirm: boolean): Promise<void> {
        const server = this.editingServer;
        if (confirm) {
            this.serverErrors.name = !server.name || server.name.length === 0;
            this.serverErrors.host = !server.host || server.host.length === 0;
            this.serverErrors.port = !server.port || isNaN(+server.port) || +server.port <= 0 || +server.port > 65535;
            this.serverErrors.duplicated = !this.serverErrors.name && this.isDuplicated(this.editingServer.name);
            if (!this.serverErrors.name && !this.serverErrors.host && !this.serverErrors.port && !this.serverErrors.duplicated) {
                this.modalRef.hide();
                const created = await this.hub.createServer(this.auth.token, server);
                if (created) {
                    this.allMyServers.push(server);
                    this.changePageMine(this.currentPage.mine);
                    this.availableServers.mine = this.allMyServers.length;
                }
            }
        } else {
            this.modalRef.hide();
        }
    }

    private isDuplicated(name: string): boolean {
        return (!!this.allPublicServers.find(s => s.name === name) || !!this.allMyServers.find(s => s.name === name));
    }

    private slice(array: GameServer[], index: number) {
        const length = array.length;

        if (index === 0) {
            return array.slice(1);
        } else if (index === length - 1) {
            return array.slice(0, length - 1);
        } else {
            return [
                ...array.slice(0, index),
                ...array.slice(index + 1)
            ];
        }
    }
}
