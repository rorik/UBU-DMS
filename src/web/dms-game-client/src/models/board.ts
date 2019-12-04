import { Cell, SerializedCell } from "./cell";

export class Board {
    public cells: Cell[][];
    public get dimensions(): { width: number, height: number } {
        return { width: this.width, height: this.height };
    }

    public get height(): number {
        return this.cells.length;
    }

    public get width(): number {
        return this.height === 0 ? 0 : this.cells[0].length;
    }

    public get(x: number, y: number): Cell {
        return this.cells[y][x];
    }

    public constructor(board?: SerializedCell[][]) {
        if (board) {
            this.cells = board.map(row => row.map(cell => {
                const deserializedCell = new Cell();
                deserializedCell.x = cell.x;
                deserializedCell.y = cell.y;
                deserializedCell.player = cell.player;
                return deserializedCell;
            }));
        }
    }

    public serialize(): SerializedCell[][] {
        return this.map(cell => ({ x: cell.x, y: cell.y, player: cell.player }));
    }

    public foreach(callback: (cell: Cell, x: number, y: number) => void): void {
        const dim = this.dimensions;
        for (let y = 0; y < dim.height; y++) {
            for (let x = 0; x < dim.width; x++) {
                callback(this.get(x, y), x, y);
            }
        }
    }

    public map<T>(callback: (cell: Cell, x: number, y: number) => T): T[][] {
        const dim = this.dimensions;
        const res: T[][] = [];
        for (let y = 0; y < dim.height; y++) {
            const row: T[] = [];
            for (let x = 0; x < dim.width; x++) {
                row.push(callback(this.get(x, y), x, y));
            }
            res.push(row);
        }
        return res;
    }

    public find(callback: (cell: Cell, x: number, y: number) => boolean): Cell {
        const dim = this.dimensions;
        for (let y = 0; y < dim.height; y++) {
            for (let x = 0; x < dim.width; x++) {
                if (callback(this.get(x, y), x, y)) {
                    return this.get(x, y);
                } 
            }
        }
        return null;
    }
}