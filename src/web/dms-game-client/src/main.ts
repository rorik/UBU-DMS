import { LoadingScene } from './scenes/loading';
import { Types, Game, AUTO, Scale } from 'phaser';
import { AttackScene } from './scenes/attack';
import { DefendScene } from './scenes/defend';

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
        AttackScene,
        DefendScene,
    ],
};

export const game = new Game(gameConfig);