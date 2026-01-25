import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game.config';
import { Player } from '../entities/Player';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private ground!: Phaser.GameObjects.Rectangle;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Create platforms (ground and floating platforms)
    this.createPlatforms();
    
    // Create player
    this.createPlayer();
    
    // Setup collisions
    this.setupCollisions();
    
    // Display UI
    this.createUI();

    console.log('GameScene created - Step 3: Player Movement');
  }

  /**
   * Create the ground and platforms
   */
  private createPlatforms(): void {
    // Create a static physics group for platforms
    this.platforms = this.physics.add.staticGroup();
    
    // Ground - brown rectangle at bottom
    const groundHeight = 32;
    this.ground = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT - groundHeight / 2,
      GAME_WIDTH,
      groundHeight,
      0x8B4513  // Brown color
    );
    this.platforms.add(this.ground);
    
    // Add some floating platforms for testing
    const platformColor = 0x666666; // Gray
    
    // Platform 1 - left side
    const plat1 = this.add.rectangle(100, 200, 80, 16, platformColor);
    this.platforms.add(plat1);
    
    // Platform 2 - middle
    const plat2 = this.add.rectangle(240, 160, 100, 16, platformColor);
    this.platforms.add(plat2);
    
    // Platform 3 - right side
    const plat3 = this.add.rectangle(380, 200, 80, 16, platformColor);
    this.platforms.add(plat3);
    
    // Platform 4 - high middle
    const plat4 = this.add.rectangle(240, 100, 60, 16, platformColor);
    this.platforms.add(plat4);
  }

  /**
   * Create the player
   */
  private createPlayer(): void {
    // Spawn player above the ground
    const spawnX = 50;
    const spawnY = GAME_HEIGHT - 64; // Above ground
    
    this.player = new Player(this, spawnX, spawnY);
  }

  /**
   * Setup collision detection
   */
  private setupCollisions(): void {
    // Player collides with platforms
    this.physics.add.collider(this.player, this.platforms);
  }

  /**
   * Create UI elements
   */
  private createUI(): void {
    // Level indicator
    this.add.text(10, 10, 'World 1-1', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'Arial',
    });

    // Step indicator
    this.add.text(GAME_WIDTH / 2, 15, 'Step 3: Player Movement', {
      fontSize: '12px',
      color: '#88ff88',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Controls help
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 8, 'Arrow keys to move, Space/Up to jump', {
      fontSize: '9px',
      color: '#aaaaaa',
      fontFamily: 'Arial',
    }).setOrigin(0.5);
  }

  update(): void {
    // Update player (handles input and movement)
    this.player.update();
  }
}
