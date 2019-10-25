import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HubServerService, ChatMessage } from 'src/app/api/hub/hub-server.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-play',
    templateUrl: './play.component.html',
    styleUrls: ['./play.component.scss']
})
export class PlayComponent implements OnInit, OnDestroy {

    public server: string;

    public chat: ChatMessage[] = [];

    public chatMessage = '';

    private chatSubscription: Subscription;

    constructor(private hub: HubServerService, private route: ActivatedRoute, private router: Router) {

    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            if (this.server && this.server.length > 0) {
                this.leaveServer();
            }
            this.server = params.get('server');
            if (this.server && this.server.length > 0) {
                this.hub.joinServer(this.server).then(joined => {
                    if (!joined) {
                        this.router.navigate(['/secure/servers']);
                    }
                });
            } else {
                this.router.navigate(['/secure/servers']);
            }
            this.chatSubscription = this.hub.chatMessageReceived.subscribe((msg: ChatMessage) => {
                if (msg.server === this.server) {
                    this.chat.push(msg);
                }
            });
        });
    }

    ngOnDestroy() {
        this.leaveServer();
    }

    public send(): boolean {
        const valid = this.chatMessage && this.chatMessage.trim().length > 0;
        if (valid) {
            this.hub.sendChatMessage(this.server, this.chatMessage.trim());
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
        this.hub.leaveServer(this.server);
        if (this.chatSubscription) {
            this.chatSubscription.unsubscribe();
        }
    }
}
