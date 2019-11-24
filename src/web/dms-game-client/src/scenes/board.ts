import { GameObjects, Scene } from 'phaser';
import { Cell } from '../models/cell';

export abstract class BoardScene extends Scene {
    protected grid: IGridElement[][];
    protected dimensions: { width: number, height: number };
    protected abstract readonly horizontalPosition: HorizontalPosition;
    protected abstract async revealTile(cell: Cell): Promise<void>;

    protected resizeGrid(width: number, height: number): void {
        let gridWidth = width * 0.5;
        let gridHeight: number;
        let y0: number;
        let x0: number;
        if (height >= gridWidth - 10) {
            gridHeight = gridWidth;
            x0 = this.horizontalPosition === HorizontalPosition.Right ? gridWidth + 10 : 0;
            y0 = (height - gridWidth) * 0.5;
            gridWidth -= 10;
        } else {
            x0 = (gridWidth - height) * 0.5;
            if (this.horizontalPosition === HorizontalPosition.Right) {
                x0 += gridWidth;
            }
            gridWidth = gridHeight = height;
            y0 = 0;
        }
        const widthFraction = gridWidth / this.dimensions.width;
        const heightFraction = gridHeight / this.dimensions.height;

        for (let i = 0; i < this.dimensions.height; i++) {
            const y = i * heightFraction + y0;
            for (let j = 0; j < this.dimensions.width; j++) {
                this.grid[i][j].rectangle.setSize(widthFraction - 2, heightFraction - 2);
                this.grid[i][j].rectangle.setPosition(j * widthFraction + x0 + 1, y + 1);
                this.grid[i][j].rectangle.setInteractive();
            }
        }
    }
}

export interface IGridElement {
    rectangle: GameObjects.Rectangle;
    cell: Cell;
}

export enum HorizontalPosition {
    Left,
    Right
}