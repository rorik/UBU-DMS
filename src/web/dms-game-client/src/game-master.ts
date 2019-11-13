import { RestClient, StatusReponse, UserStatus } from './rest';
import { Board, SerializedBoard } from './models/board';
import { Boat } from './models/boat';
import { Cell } from './models/cell';
import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';

export class GameMaster {
    public static readonly instance: GameMaster = new GameMaster();
    public readonly cellRevealed: TypedEmitter<CellRevealedEvents> = new EventEmitter() as TypedEmitter<CellRevealedEvents>;
    private static restClient: RestClient;

    private hasJoined: boolean = null;

    private self: User;
    private oponent: User;
    private boats: Boat[];

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
        this.boats = status.boats;
        this.oponent = {
            board: Board.deserialize(status.oponent.board, status.boats),
            username: status.oponent.username
        }
        this.self = {
            board: Board.deserialize(status.self.board, status.boats),
            username: status.self.username
        }
    }

    public async attack(cell: Cell): Promise<void> {
        await this.startingGame;
        const result = await GameMaster.restClient.attack(cell);
        if (result) {
            if (result.boat) {
                cell.boat = this.boats.find(boat => boat.id == result.boat);
            }
            cell.isVisible = result.isVisible;
            cell.isHit = result.isHit;
            this.cellRevealed.emit('oponent', cell, this.oponent.board);
        }
        // TODO wait for oponent attack
    }

    public async getSelfBoard(): Promise<Board> {
        await this.reloading;
        return this.self.board;
    }

    public async getOponentBoard(): Promise<Board> {
        await this.reloading;
        return this.oponent.board;
    }

    public get joinStatus(): { joined: boolean, error: boolean, url: string } {
        return { joined: !!this.hasJoined, error: this.hasJoined === false, url: GameMaster.restClient.serverUrl };
    }

    public async isOponentGameOver(): Promise<boolean> {
        return (await this.getOponentBoard()).find(cell => cell.boat && !cell.isVisible) === null;
    }

}

interface CellRevealedEvents {
    oponent: (cell: Cell, board: Board) => void,
    self: (cell: Cell, board: Board) => void
}

export interface User {
    board: Board;
    username: string;
}
