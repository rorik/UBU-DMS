import { RestClient, StatusReponse } from './rest';
import { Board } from './models/board';
import { Cell, SerializedCell } from './models/cell';
import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { Player } from './models/player';

export class GameMaster {
    public static readonly instance: GameMaster = new GameMaster();
    public readonly gameEvents: TypedEmitter<GameEvent> = new EventEmitter() as TypedEmitter<GameEvent>;
    private static restClient: RestClient;

    private hasJoined: boolean = null;

    // Game elements
    private player: Player;
    private players: Player[];
    private board: Board;

    private turn: boolean = false;
    private winner: boolean = null;

    public readonly loading: Promise<void>;
    public readonly startingGame: Promise<StatusReponse>;
    private reloading: Promise<void>;

    private constructor() {
        this.loading = this.joinGame();
        this.startingGame = this.startGame();
        this.reloading = this.reload();
    }

    private async joinGame(): Promise<void> {
        let token = window['dms_game_token'] as string;
        if (!token) {
            token = localStorage.getItem('token');
        }

        let server = window['dms_game_server'] as string;
        if (!server) {
            server = localStorage.getItem('game_url');
        }

        GameMaster.restClient = new RestClient(server);

        this.hasJoined = await GameMaster.restClient.join(token);
    }

    private async startGame(): Promise<StatusReponse> {
        await this.loading;
        let status = await GameMaster.restClient.getStatus();
        while (!status.started) {
            await new Promise(resolve => setTimeout(() => resolve(), 1000));
            status = await GameMaster.restClient.getStatus();
        }
        return status
    }

    private async reload(): Promise<void> {
        const status = await this.startingGame;
        this.player = status.player;
        this.players = status.players;
        this.board = status.board;
        this.turn = status.turn;
        if (!status.turn) {
            this.waitTurn();
        }
    }

    public async place(cell: SerializedCell): Promise<void> {
        await this.startingGame;
        if (this.turn) {
            const result = await GameMaster.restClient.place(cell);
            // TODO
            if (result) {
                this.turn = false;
                const board = await this.getBoard();
                this.gameEvents.emit('revealed', board.get(result.x, result.y));
                await this.waitTurn();
            }
        }
    }

    private async waitTurn(): Promise<StatusReponse> {
        await this.startingGame;
        let status = await GameMaster.restClient.getStatusBrief();
        while (!status.turn && !status.gameover) {
            await new Promise(resolve => setTimeout(() => resolve(), status.player ? 600 : 2000));
            status = await GameMaster.restClient.getStatusBrief();
        }
        this.turn = status.turn;
        const roundActions = status.round.filter(action => action && action.player !== this.player); 
        const board = await this.getBoard();
        roundActions.forEach(action => {
            board.get(action.cell.x, action.cell.y).player = action.cell.player;
            this.gameEvents.emit('revealed', board.get(action.cell.x, action.cell.y));
        });
        if (status.gameover) {
            this.winner = !!status.winner;
            this.gameEvents.emit('gameover', !!status.winner);
        }
        return status;
    }

    public async getBoard(): Promise<Board> {
        if (this.reloading) {
            await this.reloading;
        }
        return this.board;
    }

    public hasTurn(): boolean {
        return this.turn;
    }

    public isGameOver(): boolean {
        return this.winner !== null;
    }

    public isWinner(): boolean {
        return this.winner;
    }

    public get joinStatus(): { joined: boolean, error: boolean, url: string } {
        return { joined: !!this.hasJoined, error: this.hasJoined === false, url: GameMaster.restClient.serverUrl };
    }

}

interface GameEvent {
    revealed: (cell: Cell) => void,
    gameover: (winner: boolean) => void
}
