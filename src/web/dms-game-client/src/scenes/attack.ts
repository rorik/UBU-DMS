import { Types, GameObjects, Scene } from 'phaser';
import { Cell } from '../models/cell';
import { GameMaster } from '../game-master';

export const sceneConfig: Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'attack',
};

export class AttackScene extends Scene {
    private readonly gameMaster: GameMaster = GameMaster.instance;
    private grid: IGridElement[][];
    private clickPosition: { x: number, y: number };
    private dimensions: { width: number, height: number };

    constructor() {
        super(sceneConfig);
    }

    public async create(): Promise<void> {

        const board = await this.gameMaster.getOponentBoard();

        this.dimensions = board.dimensions;

        this.grid = board.map((cell: Cell, x: number, y: number) => {
            const rectangle = this.add.rectangle(0, 0, 0, 0, cell.boat ? 0xFF0000 : 0x0000FF, cell.isVisible ? 1 : 0.4);
            rectangle
                .on('pointerdown', () => this.clickPosition = { x, y })
                .on('pointerup', () => this.clickGrid(x, y))
                .on('pointermove', () => this.hoverGrid(x, y))
                .on('pointerout', () => this.leaveGrid(x, y));
            return { rectangle, cell };
        });

        this.gameMaster.cellRevealed.on('oponent', (cell: Cell) => this.revealTile(cell));

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
            x0 = 0;
            y0 = (height - gridWidth) * 0.5;
            gridWidth -= 10;
        } else {
            x0 = (gridWidth - height) * 0.5;
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

    private hoverGrid(x: number, y: number): void {
        if (!this.grid[y][x].cell.isVisible) {
            if (this.gameMaster.isGameOver()) {
                this.grid[y][x].rectangle.input.cursor = 'default';
            } else {
                this.grid[y][x].rectangle.input.cursor = this.gameMaster.hasTurn() ? 'pointer' : 'progress';
                this.grid[y][x].rectangle.fillAlpha = 0.7;
            }
        }
    }

    private leaveGrid(x: number, y: number): void {
        if (!this.grid[y][x].cell.isVisible) {
            this.grid[y][x].rectangle.fillAlpha = 0.4;
        }
    }

    private clickGrid(x: number, y: number): void {
        if (x == this.clickPosition.x && y == this.clickPosition.y) {
            this.gameMaster.attack(this.grid[y][x].cell);
        }
    }

    private revealTile(cell: Cell): void {
        this.grid[cell.y][cell.x].rectangle.input.cursor = 'default';
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
