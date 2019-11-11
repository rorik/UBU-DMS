import { RestClient } from './rest';
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

        GameMaster.restClient = new RestClient(server);

        this.hasJoined = await GameMaster.restClient.join(token);
    }

    public async attack(cell: Cell): Promise<void> {
        await this.loading;
        // TODO
        //* GameMaster.restClient.attack(cell.serialize());
        //! Work around until game server is working

        cell.isVisible = true;
        cell.isHit = true;
        this.cellRevealed.emit("oponent", cell, this.oponentBoard);

        if (await this.isOponentGameOver()) {
            this.revealAllOponent();
        }
        //! ------
    }

    public async getSelfBoard(): Promise<Board> {
        if (!this.selfBoard) {
            await this.reload();
        }
        return this.selfBoard;
    }

    public async getOponentBoard(): Promise<Board> {
        //* if (!this.oponentBoard) {
        //*     await this.reload();
        //* }
        //! Work around until game server is working
        if (!this.oponentBoard) {
            this.oponentBoard = this.fakeBoard();
        }
        //! ------
        return this.oponentBoard;
    }

    private async reload(): Promise<void> {
        await this.loading;
        const status = await GameMaster.restClient.getStatus();
        if (status) {
            this.boats = status.boats;
            this.oponentBoard = Board.deserialize(status.oponent.board, status.boats);
            this.selfBoard = Board.deserialize(status.self.board, status.boats);
        } else {
            this.joinGame();
        }
    }

    public joinStatus(): { joined: boolean, error: boolean } {
        return { joined: !!this.hasJoined, error: this.hasJoined === false };
    }

    public async isOponentGameOver(): Promise<boolean> {
        return (await this.getOponentBoard()).find(cell => cell.boat && !cell.isVisible) === null;
    }

    //! Server placeholder
    private fakeBoard(boatIdOffset: number = 0, boats: number[] = [5, 4, 3, 2, 1], dim: { x: number, y: number } = { x: 8, y: 8 }): Board {
        const board: SerializedBoard = { cells: [] };
        for (let y = 0; y < dim.y; y++) {
            const row = [];
            for (let x = 0; x < dim.x; x++) {
                row.push({ x: x, y: y, isVisible: false, isHit: false, boat: undefined })
            }
            board.cells.push(row);
        }

        let triesLeft = 10000;
        boats.forEach((size, index) => {
            let placed = false;
            const boat = index + boatIdOffset;
            while (!placed && triesLeft > 0) {
                triesLeft--;
                const x = Math.floor(Math.random() * dim.x);
                const y = Math.floor(Math.random() * dim.y);
                const direction = Math.random() >= 0.5;
                if (direction) {
                    if (x + size <= dim.x) {
                        placed = true;
                        for (let i = 0; i < size; i++) {
                            if (this.isTouchingBoat(board, x + i, y, dim)) {
                                placed = false;
                                break;
                            }
                        }
                        if (placed) {
                            for (let i = 0; i < size; i++) {
                                board.cells[y][x + i].boat = boat;
                            }
                        }
                    }
                } else if (y + size <= dim.y) {
                    placed = true;
                    for (let i = 0; i < size; i++) {
                        if (this.isTouchingBoat(board, x, y + i, dim)) {
                            placed = false;
                            break;
                        }
                    }
                    if (placed) {
                        for (let i = 0; i < size; i++) {
                            board.cells[y + i][x].boat = boat;
                        }
                    }
                }
            }
        });
        if (triesLeft == 0) {
            console.error('Ran out of tries');
        }
        return Board.deserialize(board, boats.map((size, index) => new Boat(index + boatIdOffset, { length: size })));
    }

    //! Server placeholder
    private isTouchingBoat(board: SerializedBoard, x: number, y: number, dim: { x: number, y: number }): boolean {
        return board.cells[y][x].boat !== undefined ||
            (y + 1 < dim.y && board.cells[y + 1][x].boat !== undefined) ||
            (y - 1 >= 0 && board.cells[y - 1][x].boat !== undefined) ||
            (x + 1 < dim.x && board.cells[y][x + 1].boat !== undefined) ||
            (x - 1 >= 0 && board.cells[y][x - 1].boat !== undefined);
    }

    //! Server placeholder
    private revealAllOponent(): void {
        this.oponentBoard.iterate(cell => {
            cell.isVisible = true;
            this.cellRevealed.emit("oponent", cell, this.oponentBoard);
        });
    }

}

interface CellRevealedEvents {
    oponent: (cell: Cell, board: Board) => void,
    self: (cell: Cell, board: Board) => void
}
