import { GameObjects, Scene, Types } from 'phaser';
import { Cell } from '../models/cell';
import { GameMaster } from '../game-master';
import { Board } from '../models/board';

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
        const gameover = GameMaster.instance.isGameOver();
        board.foreach((cell: Cell, x: number, y: number) => {
            cell.rectangle = this.add.rectangle(0, 0, 0, 0, 0xDDDDDD);
            cell.piece = this.add.circle(0, 0, 0, cell.player ? cell.player.color : 0);
            cell.piece.visible = !!cell.player;
            const hitbox = this.add.rectangle(0, 0, 0, 0, 0, 0);
            hitbox
                .on('pointerdown', () => this.clickPosition = { x, y })
                .on('pointerup', () => this.clickGrid(x, y));
            hitbox.setVisible(!gameover);
            cell.hitbox = hitbox;
        });
        GameMaster.instance.gameEvents.on('update', (board: Board, cell: Cell) => this.updateTile(board, cell));
        GameMaster.instance.gameEvents.on('gameover', async b => b.foreach(cell => cell.hitbox.setVisible(false)));
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
        const radius = Math.min(widthFraction, heightFraction) / 2;

        board.foreach((cell: Cell, x: number, y: number) => {
            cell.rectangle
                .setSize(widthFraction - 2, heightFraction - 2)
                .setPosition(x * widthFraction + x0 + 1, y * heightFraction + y0 + 1)
                .setInteractive();

            cell.hitbox
                .setSize(cell.rectangle.width, cell.rectangle.height)
                .setPosition(cell.rectangle.x, cell.rectangle.y)
                .setInteractive();

            if (cell.isEmpty()) {
                cell.hitbox.input.cursor = GameMaster.instance.hasTurn() ? 'pointer' : 'progress';
            }

            cell.piece
                .setRadius(radius - 2)
                .setPosition(cell.rectangle.x + radius, cell.rectangle.y + radius);
        });
    }

    private clickGrid(x: number, y: number): void {
        if (x === this.clickPosition.x && y === this.clickPosition.y) {
            GameMaster.instance.place({ x, y });
        }
    }

    protected updateTile(board: Board, cell: Cell): void {
        cell.piece.fillColor = cell.player ? cell.player.color : 0;
        cell.piece.visible = !!cell.player;

        board.foreach((cell: Cell, x: number, y: number) => {
            if (cell.isEmpty()) {
                cell.hitbox.input.cursor = GameMaster.instance.hasTurn() ? 'pointer' : 'progress';
            } else {
                cell.hitbox.input.cursor = 'default';
            }
        });
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