import { RestClient, StatusReponse } from './rest';
import { Board } from './models/board';
import { Cell, SerializedCell } from './models/cell';
import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { Player } from './models/player';

export class GameMaster {
    public static instance: GameMaster = new GameMaster();
    public readonly gameEvents: TypedEmitter<GameEvent> = new EventEmitter() as TypedEmitter<GameEvent>;
    private static restClient: RestClient;

    private hasJoined: boolean = null;

    // Game elements
    private player: Player;
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
        return status;
    }

    private async reload(): Promise<void> {
        const status = await this.startingGame;
        this.player = status.player;
        this.board = new Board(status.board);
        this.turn = status.turn;
        if (status.gameover) {
            this.winner = !!status.winner;
            this.gameEvents.emit('gameover', this.board, !!status.winner);
        }
        else if (!status.turn) {
            this.waitTurn();
        }
    }

    public async place(cell: SerializedCell): Promise<void> {
        await this.startingGame;
        if (this.turn && !this.isGameOver()) {
            const result = await GameMaster.restClient.place(cell);
            if (result) {
                this.turn = false;
                const board = await this.getBoard();

                result.updates.forEach(cell => {
                    board.get(cell.x, cell.y).player = cell.player;
                    this.gameEvents.emit('update', board, board.get(cell.x, cell.y));
                });

                await this.waitTurn();
            } else {
                this.restart();
            }
        }
    }

    private async waitTurn(): Promise<StatusReponse> {
        await this.startingGame;
        let status = await GameMaster.restClient.getStatusBrief();
        while (!status.turn && !status.gameover) {
            await new Promise(resolve => setTimeout(() => resolve(), status.player ? 600 : 2000));
            status = await GameMaster.restClient.getStatusBrief();
            if (!status || !status.started) {
                this.restart();
                return;
            }
        }
        this.turn = status.turn;
        const roundActions = status.round.filter(action => action && action.player !== this.player);
        const board = await this.getBoard();
        roundActions.forEach(action => {
            board.get(action.cell.x, action.cell.y).player = action.cell.player;
            action.updates.forEach(cell => {
                board.get(cell.x, cell.y).player = cell.player;
                this.gameEvents.emit('update', board, board.get(cell.x, cell.y));
            });
        });
        if (status.gameover) {
            this.winner = !!status.winner;
            this.gameEvents.emit('gameover', board, !!status.winner);
        }
        return status;
    }

    public async getBoard(): Promise<Board> {
        if (this.reloading) {
            await this.reloading;
        }
        return this.board;
    }

    public async getPlayer(): Promise<Player> {
        if (this.reloading) {
            await this.reloading;
        }
        return this.player;
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

    private restart(): void {
        GameMaster.instance = new GameMaster();
        this.gameEvents.emit('restart');
    }

}

interface GameEvent {
    update: (board: Board, cell: Cell) => void,
    gameover: (board: Board, winner: boolean) => void,
    restart: () => void,
}
