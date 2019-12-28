import { GameObjects, Scene, Types } from 'phaser';
import { Cell } from '../models/cell';
import { GameMaster } from '../game-master';

export const sceneConfig: Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'board',
};

export class BoardScene extends Scene {
    private clickPosition: { x: number, y: number };

    constructor() {
        super(sceneConfig);
    }

    public async create(): Promise<void> {
        const board = await GameMaster.instance.getBoard();

        board.foreach((cell: Cell, x: number, y: number) => {
            const rectangle = this.add.rectangle(0, 0, 0, 0, cell.player ? cell.player.color : 0xDDDDDD);
            rectangle
                .on('pointerdown', () => this.clickPosition = { x, y })
                .on('pointerup', () => this.clickGrid(x, y))
                .on('pointermove', () => this.hoverGrid(x, y))
                .on('pointerout', () => this.leaveGrid(x, y));
            cell.rectangle = rectangle;
        });

        GameMaster.instance.gameEvents.on('revealed', (cell: Cell) => this.revealTile(cell));

        this.scale.on('resize', (gameSize: GameObjects.Components.Size) => this.resizeGrid(gameSize.width, gameSize.height));

        this.resizeGrid(this.game.renderer.width, this.game.renderer.height);
    }

    protected async resizeGrid(width: number, height: number): Promise<void> {
        let size: number;
        let y0: number;
        let x0: number;
        if (width >= height) {
            size = height;
            x0 = (width - height) * 0.5;
            y0 = 0;
        } else {
            size = width;
            x0 = 0;
            y0 = (height - width) * 0.5;
        }

        const board = await GameMaster.instance.getBoard();

        const widthFraction = size / board.width;
        const heightFraction = size / board.height;

        board.foreach((cell: Cell, x: number, y: number) => {
            cell.rectangle
                .setSize(widthFraction - 2, heightFraction - 2)
                .setPosition(x * widthFraction + x0 + 1, y * heightFraction + y0 + 1)
                .setInteractive();
        });
    }

    private async hoverGrid(x: number, y: number): Promise<void> {
        const board = await GameMaster.instance.getBoard();
        if (board.get(x, y).isEmpty()) {
            if (GameMaster.instance.isGameOver()) {
                board.get(x, y).rectangle.input.cursor = 'default';
            } else {
                board.get(x, y).rectangle.input.cursor = GameMaster.instance.hasTurn() ? 'pointer' : 'progress';
            }
        }
    }

    private async leaveGrid(x: number, y: number): Promise<void> {
        const board = await GameMaster.instance.getBoard();
        //? TODO
    }

    private async clickGrid(x: number, y: number): Promise<void> {
        if (x === this.clickPosition.x && y === this.clickPosition.y) {
            GameMaster.instance.place({ x, y });
        }
    }

    protected async revealTile(cell: Cell): Promise<void> {
        //? TODO
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