import { Cell, SerializedCell } from "./cell";
import { Boat } from "./boat";

interface IBoard {
    cells: any[][];
}

export class Board implements IBoard {
    public cells: Cell[][];

    public serialize(): SerializedBoard {
        return { cells: this.cells.map(row => row.map(cell => cell.serialize())) };
    }

    public static deserialize(board: SerializedBoard, boats: Boat[]): Board {
        const deserialized = new Board();
        deserialized.cells = board.cells.map(row => row.map(cell => Cell.deserialize(cell, boats)));
        return deserialized;
    }

    public get dimensions(): { width: number, height: number } {
        return { width: this.width, height: this.height };
    }

    public get width(): number {
        return this.cells.length;
    }
    public get height(): number {
        return this.cells.length === 0 ? 0 : this.cells[0].length;
    }

    public get(x: number, y: number): Cell {
        return this.cells[y][x];
    }

    public iterate(callback: (cell: Cell, x: number, y: number) => any) {
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

export interface SerializedBoard extends IBoard {
    cells: SerializedCell[][];
}