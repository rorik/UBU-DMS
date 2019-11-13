import { GameServer } from './../../api/hub/hub-server.service';
import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HubServerService, ChatMessage } from 'src/app/api/hub/hub-server.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-play',
    templateUrl: './play.component.html',
    styleUrls: ['./play.component.scss']
})
export class PlayComponent implements OnInit, OnDestroy {

    private server: GameServer;

    public chat: ChatMessage[] = [];

    public chatMessage = '';

    private chatSubscription: Subscription;

    constructor(private hub: HubServerService, private route: ActivatedRoute, private router: Router, private elementRef: ElementRef) {

    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            localStorage.removeItem('game_url');
            if (this.server) {
                this.leaveServer();
            }
            const serverName = params.get('server');
            if (serverName && serverName.length > 0) {
                this.hub.joinServer(serverName).then(server => {
                    if (server) {
                        this.server = server;
                        this.chatSubscription = this.hub.chatMessageReceived.subscribe((msg: ChatMessage) => {
                            if (msg.server === this.server.name) {
                                this.chat.push(msg);
                            }
                        });
                        localStorage.setItem('game_url', `${server.host}:${server.port}`);
                        this.loadScript('/gameclient/1.app.bundle.js');
                        this.loadScript('/gameclient/app.bundle.js');
                    } else {
                        this.router.navigate(['/secure/servers']);
                    }
                });
            } else {
                this.router.navigate(['/secure/servers']);
            }
        });
    }

    ngOnDestroy() {
        this.leaveServer();
    }

    private loadScript(src: string): void {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = src;
        this.elementRef.nativeElement.appendChild(script);
    }

    public send(): boolean {
        const valid = this.chatMessage && this.chatMessage.trim().length > 0;
        if (valid) {
            this.hub.sendChatMessage(this.server.name, this.chatMessage.trim());
            this.chatMessage = '';
        }
        return valid;
    }

    public resizeChatBox(chatInput: any, event?: any): void {
        if (event.inputType === 'insertLineBreak' || event.inputType === 'insertText' && !event.data) {
            const sent = this.send();
            setTimeout(() => {
                chatInput.style.height = 'auto';
                if (!sent) {
                    this.chatMessage = '';
                }
            }, 0);
        } else {
            chatInput.style.height = 'auto';
            chatInput.style.height = chatInput.scrollHeight + 1 + 'px';
        }
    }

    private leaveServer(): void {
        if (this.server) {
            this.hub.leaveServer(this.server.name);
        }
        if (this.chatSubscription) {
            this.chatSubscription.unsubscribe();
        }
    }
}
