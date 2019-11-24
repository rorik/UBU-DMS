import { Types, Scene, GameObjects } from 'phaser';
import { GameMaster } from '../game-master';

export const sceneConfig: Types.Scenes.SettingsConfig = {
    active: false,
    visible: true,
    key: 'gameover',
};

export class GameOverScene extends Scene {
    private gameover: GameObjects.Image;
    private result: GameObjects.Image;
    
    constructor() {
        super(sceneConfig);
    }
    
    public create(): void {
        this.gameover = this.add.image(0, 0, 'gameover');
        
        if (GameMaster.instance.isWinner()) {
            this.result = this.add.image(0, 0, 'winner');
        } else {
            this.result = this.add.image(0, 0, 'loser');
        }

        this.gameover.alpha = this.result.alpha = 0.85;
        
        this.scale.on('resize', (gameSize: GameObjects.Components.Size) => this.resize(gameSize.width, gameSize.height));
        this.resize(this.game.renderer.width, this.game.renderer.height);
    }

    private resize(width: number, height: number): void {
        this.gameover.setPosition(width / 2, height / 3);
        this.gameover.scale = ( height / 4 ) / this.gameover.height;

        this.result.setPosition(width / 2, height * 2 / 3);
        this.result.scale =  ( height / 8 ) / this.result.height;
    }
}