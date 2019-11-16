import { Types, GameObjects, Scene } from 'phaser';
import { Cell } from '../models/cell';
import { GameMaster } from '../game-master';

export const sceneConfig: Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'defend',
};

export class DefendScene extends Scene {
    private readonly gameMaster: GameMaster = GameMaster.instance;
    private grid: IGridElement[][];
    private dimensions: { width: number, height: number };

    constructor() {
        super(sceneConfig);
    }

    public async create(): Promise<void> {
        const board = await this.gameMaster.getSelfBoard();

        this.dimensions = board.dimensions;

        this.grid = board.map((cell: Cell, x: number, y: number) => {
            const rectangle = this.add.rectangle(0, 0, 0, 0, cell.boat ? 0xFF0000 : 0x0000FF, cell.isHit ? 1 : 0.4);
            return { rectangle, cell };
        });

        this.gameMaster.cellRevealed.on('self', (cell: Cell) => this.revealTile(cell));

        this.scale.on('resize', (gameSize: GameObjects.Components.Size) => this.resizeGrid(gameSize.width, gameSize.height));

        this.resizeGrid(this.game.renderer.width, this.game.renderer.height);
    }

    private resizeGrid(width: number, height: number): void {
        let gridWidth = width * 0.5;
        let gridHeight: number;
        let y0: number;
        let x0: number;
        if (height >= gridWidth - 10) {
            gridHeight = gridWidth;
            x0 = gridWidth + 10;
            y0 = (height - gridWidth) * 0.5;
            gridWidth -= 10;
        } else {
            x0 = width * 0.5 + (gridWidth - height) * 0.5;
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

    private revealTile(cell: Cell): void {
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
