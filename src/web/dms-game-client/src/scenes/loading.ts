import { Types, Scene, GameObjects } from 'phaser';
import { sceneConfig as attack } from "./attack";
import { sceneConfig as defend } from "./defend";
import { GameMaster } from '../game-master';

export const sceneConfig: Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'loading',
};

export class LoadingScene extends Scene {
    private gameMaster: GameMaster = GameMaster.instance;
    private loading: GameObjects.Sprite;
    private text: GameObjects.Text;

    private spin: boolean = true;

    constructor() {
        super(sceneConfig);
    }

    public preload() {
        this.text = this.add.text(20, 20, 'Loading...');
        this.load.image('loading', '/assets/img/loading.png');
    }

    public async create(): Promise<void> {
        this.loading = this.add.sprite(this.game.renderer.width / 2, this.game.renderer.height / 2, 'loading');
        this.loading.scale = 0.2;
        this.scale.on('resize', (gameSize: GameObjects.Components.Size) => this.resize(gameSize.width, gameSize.height));

        this.text.text += `\nConnecting to ${this.gameMaster.joinStatus.url}`;
        await this.gameMaster.loading;
        const status = this.gameMaster.joinStatus;
        if (!status.error && status.joined) {
            this.text.text += '\nWaiting for other players...';
            await this.gameMaster.startingGame;
            this.scene.start(attack.key);
            this.scene.start(defend.key);
        } else {
            this.text.text += '\nFailed to connect';
            this.loading.tint = 0xff0000;
            this.spin = false;
        }

    }
    resize(width: number, height: number) {
        this.loading.setPosition(width / 2, height / 2);
    }

    public update() {
        if (this.spin) {
            Phaser.Actions.Rotate([this.loading], 0.15);
        }
    }

}