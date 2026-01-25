import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_CONFIG } from '../config/game.config';

export class GameScene extends Phaser.Scene {
  private dadkin!: Phaser.GameObjects.Sprite;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Display level info
    this.add.text(10, 10, 'World 1-1', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'Arial',
    });

    // Create dadkin sprite and scale to target size
    this.dadkin = this.createDadkinSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    // Display instructions
    this.add.text(GAME_WIDTH / 2, 30, 'Step 2 Complete!', {
      fontSize: '14px',
      color: '#88ff88',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 20, 'Arrow keys to move, Space to jump', {
      fontSize: '10px',
      color: '#aaaaaa',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    console.log('GameScene created successfully');
    console.log(`Dadkin sprite scaled to ${PLAYER_CONFIG.width}x${PLAYER_CONFIG.height}`);
  }

  /**
   * Creates the Dadkin sprite and scales it to the target size
   * regardless of the source image dimensions
   */
  private createDadkinSprite(x: number, y: number): Phaser.GameObjects.Sprite {
    const sprite = this.add.sprite(x, y, 'dadkin');
    
    // Get the actual texture dimensions
    const textureWidth = sprite.width;
    const textureHeight = sprite.height;
    
    // Calculate scale to fit target size
    const scaleX = PLAYER_CONFIG.width / textureWidth;
    const scaleY = PLAYER_CONFIG.height / textureHeight;
    
    // Use the smaller scale to maintain aspect ratio
    // Or use both scales if you want exact 32x32
    const scale = Math.min(scaleX, scaleY);
    sprite.setScale(scale);
    
    console.log(`Original sprite size: ${textureWidth}x${textureHeight}`);
    console.log(`Applied scale: ${scale.toFixed(3)}`);
    
    return sprite;
  }

  update(): void {
    // Game loop - will add player movement in Step 3
  }
}
