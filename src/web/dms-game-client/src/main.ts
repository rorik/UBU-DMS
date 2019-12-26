import { LoadingScene } from './scenes/loading';
import { Types, Game, AUTO, Scale } from 'phaser';
import { BoardScene } from './scenes/board';
import { GameOverScene } from './scenes/gameover';

const gameConfig: Types.Core.GameConfig = {
    title: 'DMS Game Client',

    type: AUTO,

    width: window.innerWidth,
    height: window.innerHeight,

    scale: {
        mode: Scale.RESIZE,
        width: '100%',
        height: '100%'
    },

    parent: 'game-container',
    backgroundColor: 0,

    scene: [
        LoadingScene,
        BoardScene,
        GameOverScene
    ],
};

export const game = new Game(gameConfig);