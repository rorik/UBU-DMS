import { Types, GameObjects } from 'phaser';
import { Cell } from '../models/cell';
import { GameMaster } from '../game-master';
import { BoardScene, HorizontalPosition } from './board';

export const sceneConfig: Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'attack',
};

export class AttackScene extends BoardScene {
    protected horizontalPosition = HorizontalPosition.Left;
    private clickPosition: { x: number, y: number };

    constructor() {
        super(sceneConfig);
    }

    public async create(): Promise<void> {
        const board = await GameMaster.instance.getOponentBoard();

        this.dimensions = board.dimensions;

        this.grid = board.map((cell: Cell, x: number, y: number) => {
            const rectangle = this.add.rectangle(0, 0, 0, 0, 0, cell.isVisible ? 1 : 0.4);
            if (cell.boat) {
                rectangle.fillColor = cell.boat.isSunk ? 0x8A4545 : 0xFF0000;
            } else {
                rectangle.fillColor = 0x0000FF;
            }
            rectangle
                .on('pointerdown', () => this.clickPosition = { x, y })
                .on('pointerup', () => this.clickGrid(x, y))
                .on('pointermove', () => this.hoverGrid(x, y))
                .on('pointerout', () => this.leaveGrid(x, y));
            return { rectangle, cell };
        });

        GameMaster.instance.gameEvents.on('attack', (cell: Cell) => this.revealTile(cell));

        this.scale.on('resize', (gameSize: GameObjects.Components.Size) => this.resizeGrid(gameSize.width, gameSize.height));

        this.resizeGrid(this.game.renderer.width, this.game.renderer.height);
    }

    private hoverGrid(x: number, y: number): void {
        if (!this.grid[y][x].cell.isVisible) {
            if (GameMaster.instance.isGameOver()) {
                this.grid[y][x].rectangle.input.cursor = 'default';
            } else {
                this.grid[y][x].rectangle.input.cursor = GameMaster.instance.hasTurn() ? 'pointer' : 'progress';
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
        if (x === this.clickPosition.x && y === this.clickPosition.y) {
            GameMaster.instance.attack(this.grid[y][x].cell);
        }
    }

    protected async revealTile(cell: Cell): Promise<void> {
        this.grid[cell.y][cell.x].rectangle.input.cursor = 'default';
        if (cell.boat) {
            if (cell.boat.isSunk) {
                (await GameMaster.instance.getOponentBoard()).iterate((searchCell, x, y) => {
                    if (searchCell.boat === cell.boat) {
                        this.grid[y][x].rectangle.fillColor = 0x8A4545;
                    }
                });
            } else {
                this.grid[cell.y][cell.x].rectangle.fillColor = 0xFF0000;
            }
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
