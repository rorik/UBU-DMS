import { Types, Scene, GameObjects } from 'phaser';
import { sceneConfig as board } from "./board";
import { sceneConfig as gameover } from "./gameover";
import { GameMaster } from '../game-master';

export const sceneConfig: Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'loading',
};

export class LoadingScene extends Scene {
    private loading: GameObjects.Sprite;
    private text: GameObjects.Text;

    private spin: boolean = true;

    constructor() {
        super(sceneConfig);
    }

    public preload(): void {
        this.text = this.add.text(20, 20, 'Loading...');
        this.load.image('loading', '/assets/img/loading.png');
        this.load.image('gameover', '/assets/img/gameover.png');
        this.load.image('winner', '/assets/img/winner.png');
        this.load.image('loser', '/assets/img/loser.png');
        GameMaster.instance.gameEvents.on('gameover', () => this.scene.start(gameover.key));
    }
    
    public async create(): Promise<void> {
        this.loading = this.add.sprite(this.game.renderer.width / 2, this.game.renderer.height / 2, 'loading');
        this.loading.scale = 0.2;
        this.scale.on('resize', (gameSize: GameObjects.Components.Size) => this.resize(gameSize.width, gameSize.height));

        this.text.text += `\nConnecting to ${GameMaster.instance.joinStatus.url}`;
        await GameMaster.instance.loading;
        const status = GameMaster.instance.joinStatus;
        if (!status.error && status.joined) {
            this.text.text += '\nWaiting for other players...';
            await GameMaster.instance.startingGame;
            this.scene.start(board.key);
        } else {
            this.text.text += '\nFailed to connect';
            this.loading.tint = 0xff0000;
            this.spin = false;
        }

    }

    private resize(width: number, height: number): void {
        this.loading.setPosition(width / 2, height / 2);
    }

    public update(): void {
        if (this.spin) {
            Phaser.Actions.Rotate([this.loading], 0.15);
        }
    }

}