import Phaser from 'phaser';
import { PreloadScene } from '../scenes/PreloadScene';
import { GameScene } from '../scenes/GameScene';
import { EditorScene } from '../scenes/EditorScene';

export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 270;

// Grid / editor settings
export const TILE_SIZE = 16;
export const GRID_COLS = 30;       // 480 / 16
export const GRID_ROWS = 15;       // top 240px for grid, bottom 30px for toolbar
export const TOOLBAR_HEIGHT = 30;
export const SPRING_VELOCITY = -600;

// Player settings
export const PLAYER_CONFIG = {
  width: 32,        // Target display width
  height: 32,       // Target display height
  moveSpeed: 160,
  jumpVelocity: -350,
};

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#2d2d44',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 800 },
      debug: true, // Set to false for production
    },
  },
  scene: [PreloadScene, EditorScene, GameScene],
};
