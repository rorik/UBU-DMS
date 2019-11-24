import { Types, GameObjects } from 'phaser';
import { Cell } from '../models/cell';
import { GameMaster } from '../game-master';
import { BoardScene, HorizontalPosition } from './board';

export const sceneConfig: Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'defend',
};

export class DefendScene extends BoardScene {
    protected horizontalPosition = HorizontalPosition.Right;

    constructor() {
        super(sceneConfig);
    }

    public async create(): Promise<void> {
        const board = await GameMaster.instance.getSelfBoard();

        this.dimensions = board.dimensions;

        this.grid = board.map((cell: Cell, x: number, y: number) => {
            const rectangle = this.add.rectangle(0, 0, 0, 0, 0, cell.isHit ? 1 : 0.4);
            if (cell.boat) {
                rectangle.fillColor = cell.boat.isSunk ? 0x8A4545 : 0xFF0000;
            } else {
                rectangle.fillColor = 0x0000FF;
            }
            return { rectangle, cell };
        });

        GameMaster.instance.gameEvents.on('attacked', (cell: Cell) => this.revealTile(cell));

        this.scale.on('resize', (gameSize: GameObjects.Components.Size) => this.resizeGrid(gameSize.width, gameSize.height));

        this.resizeGrid(this.game.renderer.width, this.game.renderer.height);
    }

    protected async revealTile(cell: Cell): Promise<void> {
        if (cell.boat && cell.boat.isSunk) {
            (await GameMaster.instance.getSelfBoard()).iterate((searchCell, x, y) => {
                if (searchCell.boat === cell.boat) {
                    this.grid[y][x].rectangle.fillColor = 0x8A4545;
                }
            });
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
