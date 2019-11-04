import { Types, GameObjects, Scene } from 'phaser';
import { Cell } from '../models/cell';
import { Boat } from '../models/boat';
import { GameMaster } from '../game-master';

const gameOptions = {
    gridDimensions: { x: 10, y: 10 },
    boats: [5, 4, 3, 2, 1]
}

const sceneConfig: Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'attack',
};

export class AttackScene extends Scene {
    private grid: IGridElement[][];

    private gameMaster: GameMaster = GameMaster.instance;

    private clickPosition: { x: number, y: number };

    constructor() {
        super(sceneConfig);
    }

    public async create(): Promise<void> {

        this.grid = [];

        for (let i = 0; i < gameOptions.gridDimensions.y; i++) {
            const row: IGridElement[] = [];
            for (let j = 0; j < gameOptions.gridDimensions.x; j++) {
                const rectangle = this.add.rectangle(0, 0, 0, 0, 0x0000FF, 0.4);
                rectangle
                    .on('pointerdown', () => this.clickPosition = { x: j, y: i })
                    .on('pointerup', () => this.clickGrid(j, i))
                    .on('pointermove', () => this.hoverGrid(j, i))
                    .on('pointerout', () => this.leaveGrid(j, i));
                row.push({ rectangle, cell: new Cell({ x: j, y: i }) });
            }
            this.grid.push(row);
        }

        this.placeBoats();

        this.scale.on('resize', (gameSize: GameObjects.Components.Size) => this.resizeGrid(gameSize.width, gameSize.height));
        this.resizeGrid(window.innerWidth, window.innerHeight);
    }

    private resizeGrid(width: number, height: number): void {
        const gridWidth = width <= height ? width : height;
        const xStart = (width - gridWidth) / 2;
        const cellWidth = gridWidth / gameOptions.gridDimensions.x;
        const cellHeight = height / gameOptions.gridDimensions.y;

        for (let i = 0; i < gameOptions.gridDimensions.y; i++) {
            const y = i * cellHeight;
            for (let j = 0; j < gameOptions.gridDimensions.x; j++) {
                this.grid[i][j].rectangle.setSize(cellWidth - 2, cellHeight - 2);
                this.grid[i][j].rectangle.setPosition(j * cellWidth + xStart + 1, y + 1);
                this.grid[i][j].rectangle.setInteractive();
            }
        }
    }

    private hoverGrid(x: number, y: number): void {
        if (!this.grid[y][x].cell.isHit) {
            this.grid[y][x].rectangle.input.cursor = 'pointer';
            this.grid[y][x].rectangle.fillAlpha = 0.7;
        }
    }

    private leaveGrid(x: number, y: number): void {
        if (!this.grid[y][x].cell.isHit) {
            this.grid[y][x].rectangle.fillAlpha = 0.4;
        }
    }

    private clickGrid(x: number, y: number): void {
        if (x == this.clickPosition.x && y == this.clickPosition.y) {
            this.revealTile(x, y);
            if (this.isGameOver()) {
                this.endGame();
            }
        }
    }

    private revealTile(x: number, y: number): void {
        this.gameMaster.attack(this.grid[y][x].cell);
        if (!this.grid[y][x].cell.isHit) {
            this.grid[y][x].rectangle.input.cursor = 'default';
            this.grid[y][x].cell.isHit = true;
            if (this.grid[y][x].cell.boat) {
                this.grid[y][x].rectangle.fillColor = 0xFF0000;
            }
            this.tweens.add({
                targets: this.grid[y][x].rectangle,
                fillAlpha: 1,
                ease: 'Linear',
                duration: 1000,
                repeat: 0,
                yoyo: false
            });
        }
    }

    private endGame(): void {
        for (let i = 0; i < gameOptions.gridDimensions.y; i++) {
            for (let j = 0; j < gameOptions.gridDimensions.x; j++) {
                this.revealTile(i, j);
            }
        }
    }

    /* Mock Server */

    private placeBoats(): void {
        let triesLeft = 10000;
        gameOptions.boats.forEach((size, index) => {
            let placed = false;
            const boat = new Boat(index, { length: size });
            while (!placed && triesLeft > 0) {
                triesLeft--;
                const x = Math.floor(Math.random() * gameOptions.gridDimensions.x);
                const y = Math.floor(Math.random() * gameOptions.gridDimensions.y);
                const direction = Math.random() >= 0.5;
                if (direction) {
                    if (x + size <= gameOptions.gridDimensions.x) {
                        placed = true;
                        for (let i = 0; i < size; i++) {
                            if (this.isTouchingBoat(x + i, y)) {
                                placed = false;
                                break;
                            }
                        }
                        if (placed) {
                            for (let i = 0; i < size; i++) {
                                this.grid[y][x + i].cell.boat = boat;
                            }
                        }
                    }
                } else if (y + size <= gameOptions.gridDimensions.y) {
                    placed = true;
                    for (let i = 0; i < size; i++) {
                        if (this.isTouchingBoat(x, y + i)) {
                            placed = false;
                            break;
                        }
                    }
                    if (placed) {
                        for (let i = 0; i < size; i++) {
                            this.grid[y + i][x].cell.boat = boat;
                        }
                    }
                }
            }
        });
        if (triesLeft == 0) {
            console.error('Ran out of tries');
        }
    }

    private isTouchingBoat(x: number, y: number): boolean {
        return !!this.grid[y][x].cell.boat ||
            (y + 1 < gameOptions.gridDimensions.y && !!this.grid[y + 1][x].cell.boat) ||
            (y - 1 >= 0 && !!this.grid[y - 1][x].cell.boat) ||
            (x + 1 < gameOptions.gridDimensions.x && !!this.grid[y][x + 1].cell.boat) ||
            (x - 1 >= 0 && !!this.grid[y][x - 1].cell.boat);
    }

    private isGameOver(): boolean {
        for (let i = 0; i < gameOptions.gridDimensions.y; i++) {
            for (let j = 0; j < gameOptions.gridDimensions.x; j++) {
                if (this.grid[i][j].cell.boat && !this.grid[i][j].cell.isHit) {
                    return false;
                }
            }
        }
        return true;
    }
}

interface IGridElement {
    rectangle: GameObjects.Rectangle;
    cell: Cell;
}