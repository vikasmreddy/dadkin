import Phaser from 'phaser';
import { PLAYER_CONFIG } from '../config/game.config';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  
  // Double jump tracking
  private jumpCount: number = 0;
  private maxJumps: number = 2;
  private jumpKeyWasReleased: boolean = true;
  
  // Spin animation
  private isSpinning: boolean = false;
  private spinTween: Phaser.Tweens.Tween | null = null;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'dadkin');
    
    // Add to scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Scale sprite to target size
    this.scaleToTargetSize();
    
    // Configure physics body
    this.setupPhysicsBody();
    
    // Setup input
    this.setupInput();
  }
  
  /**
   * Scale the sprite to match PLAYER_CONFIG dimensions
   */
  private scaleToTargetSize(): void {
    const scaleX = PLAYER_CONFIG.width / this.width;
    const scaleY = PLAYER_CONFIG.height / this.height;
    const scale = Math.min(scaleX, scaleY);
    this.setScale(scale);
  }
  
  /**
   * Configure the physics body
   */
  private setupPhysicsBody(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    // Prevent player from leaving the world bounds
    body.setCollideWorldBounds(true);
    
    // Set drag for smoother stopping
    body.setDrag(PLAYER_CONFIG.moveSpeed * 4, 0);
    
    // Set max velocity
    body.setMaxVelocity(PLAYER_CONFIG.moveSpeed, 600);
  }
  
  /**
   * Setup keyboard input
   */
  private setupInput(): void {
    const keyboard = this.scene.input.keyboard;
    if (!keyboard) {
      console.error('Keyboard input not available');
      return;
    }
    
    this.cursors = keyboard.createCursorKeys();
    this.spaceKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }
  
  /**
   * Update player state - call this from scene's update()
   */
  update(): void {
    this.handleMovement();
    this.handleJump();
  }
  
  /**
   * Handle left/right movement
   */
  private handleMovement(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    if (this.cursors.left.isDown) {
      // Move left
      body.setVelocityX(-PLAYER_CONFIG.moveSpeed);
      this.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      // Move right
      body.setVelocityX(PLAYER_CONFIG.moveSpeed);
      this.setFlipX(false);
    } else {
      // Slow down when no input (drag handles this, but we can also set directly)
      body.setVelocityX(0);
    }
  }
  
  /**
   * Handle jumping - supports double jump with spin
   */
  private handleJump(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const isOnGround = body.blocked.down || body.touching.down;
    
    // Reset jump count and rotation when landing on ground
    if (isOnGround) {
      this.jumpCount = 0;
      this.stopSpin();
    }
    
    // Check if jump key is pressed
    const jumpPressed = this.spaceKey.isDown || this.cursors.up.isDown;
    
    // Only jump on key press (not hold) - prevents instant double jump
    if (jumpPressed && this.jumpKeyWasReleased) {
      if (this.jumpCount < this.maxJumps) {
        // Perform jump
        body.setVelocityY(PLAYER_CONFIG.jumpVelocity);
        this.jumpCount++;
        this.jumpKeyWasReleased = false;
        
        // Spin on double jump (second jump)
        if (this.jumpCount === 2) {
          this.startSpin();
        }
      }
    }
    
    // Track key release for next jump
    if (!jumpPressed) {
      this.jumpKeyWasReleased = true;
    }
  }
  
  /**
   * Start the spin animation for double jump
   */
  private startSpin(): void {
    if (this.isSpinning) return;
    
    this.isSpinning = true;
    
    // Determine spin direction based on facing direction
    const spinDirection = this.flipX ? -360 : 360;
    
    // Create spin tween - full 360 rotation
    this.spinTween = this.scene.tweens.add({
      targets: this,
      angle: spinDirection,
      duration: 400,  // Spin duration in ms
      ease: 'Linear',
      onComplete: () => {
        // Keep spinning if still in air
        if (!this.isOnGround() && this.isSpinning) {
          this.angle = 0;
          this.startSpin();
        }
      }
    });
  }
  
  /**
   * Stop the spin animation and reset rotation
   */
  private stopSpin(): void {
    if (!this.isSpinning) return;
    
    this.isSpinning = false;
    
    // Stop any active spin tween
    if (this.spinTween) {
      this.spinTween.stop();
      this.spinTween = null;
    }
    
    // Reset rotation
    this.angle = 0;
  }
  
  /**
   * Check if player is on the ground
   */
  isOnGround(): boolean {
    const body = this.body as Phaser.Physics.Arcade.Body;
    return body.blocked.down || body.touching.down;
  }
}
