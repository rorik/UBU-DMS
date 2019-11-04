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
}

export interface SerializedBoard extends IBoard {
    cells: SerializedCell[][];
}