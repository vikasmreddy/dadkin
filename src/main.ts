import Phaser from 'phaser';
import { gameConfig } from './config/game.config';

// Create the game instance
const game = new Phaser.Game(gameConfig);

// Log startup info
console.log(`Phaser v${Phaser.VERSION} initialized`);
console.log(`Game resolution: ${gameConfig.width}x${gameConfig.height}`);

// Expose game instance for debugging (development only)
if (import.meta.env.DEV) {
  (window as unknown as { game: Phaser.Game }).game = game;
}
