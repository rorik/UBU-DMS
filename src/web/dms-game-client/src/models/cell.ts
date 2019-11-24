import { Boat } from "./boat";

export interface ICell {
    x: number;
    y: number;
    isVisible?: boolean;
    isHit?: boolean;
    boat?: any;
}

export class Cell implements ICell {
    public x: number;
    public y: number;
    public isVisible: boolean = false;
    public isHit: boolean = false;
    public boat?: Boat;

    public serialize(): SerializedCell {
        return {x: this.x, y: this.y, boat: this.boat.id };
    }

    public static deserialize(cell: SerializedCell, boats: Boat[]): Cell {
        const deserialized = new Cell();
        deserialized.x = cell.x;
        deserialized.y = cell.y;
        deserialized.isVisible = cell.isVisible;
        deserialized.isHit = cell.isHit;
        if (cell.boat !== undefined && cell.boat !== null) {
            deserialized.boat = boats.find(boat => boat.id == cell.boat);
            if (!deserialized.boat) {
                throw new Error('Boat not found');
            }
        }
        return deserialized;
    }
}

export interface SerializedCell extends ICell {
    boat?: number;
}