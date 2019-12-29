import { GameObjects } from "phaser";
import { Player } from "./player";

export interface SerializedCell {
    x: number;
    y: number;
    player?: Player;
}

export class Cell implements SerializedCell {
    public x: number;
    public y: number;
    public player?: Player;
    public rectangle: GameObjects.Rectangle;
    public hitbox: GameObjects.Rectangle;
    public piece: GameObjects.Arc;

    public serialize(): SerializedCell {
        return { x: this.x, y: this.y, player: this.player };
    }

    public static deserialize(cell: SerializedCell): Cell {
        const deserialized = new Cell();
        deserialized.x = cell.x;
        deserialized.y = cell.y;
        deserialized.player = cell.player;
        return deserialized;
    }

    public isEmpty(): boolean {
        return !this.player;
    }
}