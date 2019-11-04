import { RestClient } from './rest';
import { Board } from './models/board';
import { Boat } from './models/boat';
import { Cell } from './models/cell';

export class GameMaster {
    public static readonly instance: GameMaster = new GameMaster();
    private static rest: RestClient;

    private hasJoined: boolean = null;

    private selfBoard: Board;
    private oponentBoard: Board;
    private boats: Boat[];

    public readonly loading: Promise<void>;

    private constructor() {
        this.loading = this.joinGame();
    }

    private async joinGame(): Promise<void> {

        let token = window['dms_game_token'];
        if (!token) {
            token = localStorage.getItem('token');
        }

        let server = window['dms_game_server'];
        if (!token) {
            server = localStorage.getItem('game_url');
        }

        GameMaster.rest = new RestClient(server);

        this.hasJoined = await GameMaster.rest.join(token);
    }

    public async attack(cell: Cell): Promise<void> {
        await this.loading;
        // TODO
    }

    public async getSelfBoard(): Promise<Board> {
        if (!this.selfBoard) {
            await this.reload();
        }
        return this.selfBoard;
    }

    public async getOponentBoard(): Promise<Board> {
        if (!this.oponentBoard) {
            await this.reload();
        }
        return this.oponentBoard;
    }

    private async reload(): Promise<void> {
        await this.loading;
        const status = await GameMaster.rest.getStatus();
        if (status) {
            this.boats = status.boats;
            this.oponentBoard = Board.deserialize(status.oponentBoard, status.boats);
            this.selfBoard = Board.deserialize(status.selfBoard, status.boats);
        } else {
            this.joinGame();
        }
    }

    public joinStatus(): { joined: boolean, error: boolean} {
        return { joined: !!this.hasJoined, error: this.hasJoined === false  };
    }

}
