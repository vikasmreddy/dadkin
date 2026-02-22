import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    // Show loading progress
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Loading text
    const loadingText = this.add.text(width / 2, height / 2 - 20, 'Loading...', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Progress bar background
    const progressBarBg = this.add.rectangle(width / 2, height / 2 + 10, 200, 20, 0x444444);
    
    // Progress bar fill
    const progressBar = this.add.rectangle(width / 2 - 98, height / 2 + 10, 0, 16, 0x88ff88);
    progressBar.setOrigin(0, 0.5);

    // Update progress bar as assets load
    this.load.on('progress', (value: number) => {
      progressBar.width = 196 * value;
    });

    this.load.on('complete', () => {
      loadingText.setText('Complete!');
    });

    // Load game assets
    this.load.image('dadkin', 'assets/dadkin.png');
    
    // Placeholder assets will be created programmatically in GameScene
  }

  create(): void {
    // Transition to game scene
    this.scene.start('EditorScene');
  }
}
