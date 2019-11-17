import { RestClient, StatusReponse } from './rest';
import { Board } from './models/board';
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
        this.boats = status.boats;
        this.oponent = {
            board: Board.deserialize(status.oponent.board, status.boats),
            username: status.oponent.username
        }
        this.self = {
            board: Board.deserialize(status.self.board, status.boats),
            username: status.self.username
        }
        this.turn = status.turn;
        if (!status.turn) {
            this.waitTurn();
        }
    }

    public async attack(cell: Cell): Promise<void> {
        await this.startingGame;
        if (this.turn) {
            const result = await GameMaster.restClient.attack(cell);
            if (result) {
                this.turn = false;
                if (result.boat) {
                    const boat = this.boats.find(boat => boat.id == result.boat.id);
                    boat.isSunk = result.boat.isSunk;
                    cell.boat = boat;
                }
                cell.isVisible = result.cell.isVisible;
                cell.isHit = result.cell.isHit;
                this.cellRevealed.emit('oponent', cell, this.oponent.board);
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
        if (status.oponent.lastMove) {
            const cell = this.self.board.get(status.oponent.lastMove.cell.x, status.oponent.lastMove.cell.y);
            if (status.oponent.lastMove.boat) {
                const boat = this.boats.find(boat => boat.id == status.oponent.lastMove.boat.id);
                boat.isSunk = status.oponent.lastMove.boat.isSunk;
                cell.boat = boat;
            }
            cell.isVisible = status.oponent.lastMove.cell.isVisible;
            cell.isHit = status.oponent.lastMove.cell.isHit;
            this.cellRevealed.emit('self', cell, this.self.board);
        }
        if (status.gameover) {
            this.winner = !!status.winner;
            this.cellRevealed.emit('gameover', !!status.winner);
        }
        return status;
    }

    public async getSelfBoard(): Promise<Board> {
        if (this.reloading) {
            await this.reloading;
        }
        return this.self.board;
    }

    public async getOponentBoard(): Promise<Board> {
        if (this.reloading) {
            await this.reloading;
        }
        return this.oponent.board;
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

interface CellRevealedEvents {
    oponent: (cell: Cell, board: Board) => void,
    self: (cell: Cell, board: Board) => void,
    gameover: (winner: boolean) => void
}

export interface User {
    board: Board;
    username: string;
}
