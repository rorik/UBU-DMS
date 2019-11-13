import { Types, GameObjects, Scene } from 'phaser';
import { Cell } from '../models/cell';
import { GameMaster } from '../game-master';

export const sceneConfig: Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'defend',
};

export class DefendScene extends Scene {
    private gameMaster: GameMaster = GameMaster.instance;
    private grid: IGridElement[][];
    private dimensions: { width: number, height: number };

    constructor() {
        super(sceneConfig);
    }

    public async create(): Promise<void> {
        const board = await this.gameMaster.getOponentBoard();

        this.dimensions = board.dimensions;

        this.grid = board.map((cell: Cell, x: number, y: number) => {
            const rectangle = this.add.rectangle(0, 0, 0, 0, 0x0000FF, 0.4);
            return { rectangle, cell };
        });

        this.gameMaster.cellRevealed.on('self', (cell: Cell) => this.revealTile(cell));

        this.scale.on('resize', (gameSize: GameObjects.Components.Size) => this.resizeGrid(gameSize.width, gameSize.height));

        this.resizeGrid(this.game.renderer.width, this.game.renderer.height);
    }

    private resizeGrid(width: number, height: number): void {
        const gridWidth = width <= height ? width : height;
        const xStart = width - gridWidth;
        const cellWidth = gridWidth / this.dimensions.width;
        const cellHeight = height / this.dimensions.height;

        for (let i = 0; i < this.dimensions.height; i++) {
            const y = i * cellHeight;
            for (let j = 0; j < this.dimensions.width; j++) {
                this.grid[i][j].rectangle.setSize(cellWidth - 2, cellHeight - 2);
                this.grid[i][j].rectangle.setPosition(j * cellWidth + xStart + 1, y + 1);
                this.grid[i][j].rectangle.setInteractive();
            }
        }
    }

    private revealTile(cell: Cell): void {
        if (cell.boat) {
            this.grid[cell.y][cell.x].rectangle.fillColor = 0xFF0000;
        }
        this.tweens.add({
            targets: this.grid[cell.y][cell.x].rectangle,
            fillAlpha: 1,
            ease: 'Linear',
            duration: 1000,
            repeat: 0,
            yoyo: false
        });
    }
}

interface IGridElement {
    rectangle: GameObjects.Rectangle;
    cell: Cell;
}
