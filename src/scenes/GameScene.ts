import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, SPRING_VELOCITY } from '../config/game.config';
import { Player } from '../entities/Player';
import { LevelData, CellType } from '../types/level.types';
import { createDefaultLevel } from '../utils/LevelUtils';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private spikes!: Phaser.Physics.Arcade.StaticGroup;
  private springs!: Phaser.Physics.Arcade.StaticGroup;
  private goal!: Phaser.Physics.Arcade.StaticGroup;
  private showTouchControls = false;

  private levelData!: LevelData;
  private fromEditor = false;
  private levelComplete = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { level?: LevelData; fromEditor?: boolean }): void {
    this.levelData = data.level ?? createDefaultLevel();
    this.fromEditor = data.fromEditor ?? false;
    this.levelComplete = false;
    this.showTouchControls = this.shouldShowTouchControls();
  }

  create(): void {
    this.createFromLevelData();
    this.createPlayer();
    this.setupCollisions();
    this.createUI();
    this.createTouchControls();
  }

  private createFromLevelData(): void {
    this.platforms = this.physics.add.staticGroup();
    this.spikes = this.physics.add.staticGroup();
    this.springs = this.physics.add.staticGroup();
    this.goal = this.physics.add.staticGroup();

    for (const cell of this.levelData.cells) {
      const x = cell.col * TILE_SIZE + TILE_SIZE / 2;
      const y = cell.row * TILE_SIZE + TILE_SIZE / 2;

      switch (cell.type) {
        case CellType.Platform: {
          const block = this.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, 0x8b4513);
          this.platforms.add(block);
          break;
        }
        case CellType.Spike: {
          // Draw a red triangle
          const gfx = this.add.graphics();
          gfx.fillStyle(0xff0000);
          gfx.fillTriangle(
            x - TILE_SIZE / 2, y + TILE_SIZE / 2,
            x + TILE_SIZE / 2, y + TILE_SIZE / 2,
            x, y - TILE_SIZE / 2
          );
          // Invisible hitbox for physics
          const spikeHit = this.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, 0xff0000, 0);
          this.spikes.add(spikeHit);
          break;
        }
        case CellType.Spring: {
          const springRect = this.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, 0x00cc44);
          this.springs.add(springRect);
          break;
        }
        case CellType.Goal: {
          const goalRect = this.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, 0xff8800);
          this.goal.add(goalRect);
          break;
        }
        // PlayerStart is handled in createPlayer
      }
    }
  }

  private createPlayer(): void {
    // Find the player start cell
    const startCell = this.levelData.cells.find(c => c.type === CellType.PlayerStart);
    const spawnX = startCell
      ? startCell.col * TILE_SIZE + TILE_SIZE / 2
      : 50;
    const spawnY = startCell
      ? startCell.row * TILE_SIZE + TILE_SIZE / 2
      : GAME_HEIGHT - 64;

    this.player = new Player(this, spawnX, spawnY);
  }

  private setupCollisions(): void {
    this.physics.add.collider(this.player, this.platforms);

    // Spikes — kill player
    this.physics.add.overlap(this.player, this.spikes, () => {
      this.handleSpikeDeath();
    });

    // Springs — bounce player up (only when falling onto it)
    this.physics.add.overlap(this.player, this.springs, () => {
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      if (body.velocity.y > 0) {
        body.setVelocityY(SPRING_VELOCITY);
      }
    });

    // Goal — win the level
    this.physics.add.overlap(this.player, this.goal, () => {
      this.handleGoalReached();
    });
  }

  private handleSpikeDeath(): void {
    if (this.levelComplete) return;

    // Screen shake
    this.cameras.main.shake(300, 0.01);

    // Red flash
    this.cameras.main.flash(200, 255, 0, 0);

    // Restart the level after a short delay
    this.time.delayedCall(400, () => {
      this.scene.restart({ level: this.levelData, fromEditor: this.fromEditor });
    });

    // Freeze the player so they can't keep moving
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.setAllowGravity(false);
    this.player.setAlpha(0.5);
    this.levelComplete = true; // reuse flag to prevent multiple triggers
  }

  private handleGoalReached(): void {
    if (this.levelComplete) return;
    this.levelComplete = true;

    // Freeze player
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.setAllowGravity(false);

    // Show win message
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'You found the kid!', {
      fontSize: '18px',
      color: '#ffdd00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Return to editor after 2 seconds
    this.time.delayedCall(2000, () => {
      this.scene.start('EditorScene');
    });
  }

  private createUI(): void {
    const helpText = this.showTouchControls
      ? 'Use the buttons to move and jump'
      : 'Arrow keys to move, Space/Up to jump';
    const helpY = this.showTouchControls ? 10 : GAME_HEIGHT - 8;

    this.add.text(GAME_WIDTH / 2, helpY, helpText, {
      fontSize: '9px',
      color: '#aaaaaa',
      fontFamily: 'Arial',
    }).setOrigin(0.5, this.showTouchControls ? 0 : 0.5);

    // Edit button (only when launched from editor)
    if (this.fromEditor) {
      const editBtn = this.add.text(8, 8, '< Edit', {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'Arial',
        backgroundColor: '#444466',
        padding: { x: 6, y: 3 },
      }).setInteractive({ useHandCursor: true });

      editBtn.on('pointerdown', () => {
        this.scene.start('EditorScene');
      });
    }
  }

  private createTouchControls(): void {
    if (!this.showTouchControls) return;

    const pointersNeeded = 3 - this.input.manager.pointersTotal;
    if (pointersNeeded > 0) {
      this.input.addPointer(pointersNeeded);
    }

    const buttonRadius = 22;
    const buttonY = GAME_HEIGHT - 42;
    const leftX = 42;
    const rightX = 94;
    const jumpX = GAME_WIDTH - 48;

    const leftButton = this.createTouchButton(leftX, buttonY, buttonRadius, '<');
    const rightButton = this.createTouchButton(rightX, buttonY, buttonRadius, '>');
    const jumpButton = this.createTouchButton(jumpX, buttonY, 26, 'JUMP', 10);

    this.bindTouchButton(leftButton, { left: true }, { left: false });
    this.bindTouchButton(rightButton, { right: true }, { right: false });
    this.bindTouchButton(jumpButton, { jump: true }, { jump: false });
  }

  private createTouchButton(
    x: number,
    y: number,
    radius: number,
    label: string,
    fontSize = 18,
  ): Phaser.GameObjects.Container {
    const circle = this.add.circle(0, 0, radius, 0x111122, 0.55);
    circle.setStrokeStyle(2, 0xffffff, 0.25);

    const text = this.add.text(0, 0, label, {
      fontSize: `${fontSize}px`,
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    const button = this.add.container(x, y, [circle, text]);
    button.setSize(radius * 2, radius * 2);
    button.setInteractive(
      new Phaser.Geom.Circle(0, 0, radius),
      Phaser.Geom.Circle.Contains,
    );

    return button;
  }

  private bindTouchButton(
    button: Phaser.GameObjects.Container,
    pressedState: Partial<{ left: boolean; right: boolean; jump: boolean }>,
    releasedState: Partial<{ left: boolean; right: boolean; jump: boolean }>,
  ): void {
    button.on('pointerdown', () => {
      this.player.setTouchInputState(pressedState);
      button.setAlpha(0.85);
    });

    button.on('pointerup', () => {
      this.player.setTouchInputState(releasedState);
      button.setAlpha(1);
    });

    button.on('pointerout', () => {
      this.player.setTouchInputState(releasedState);
      button.setAlpha(1);
    });
  }

  private shouldShowTouchControls(): boolean {
    return this.sys.game.device.input.touch
      || window.matchMedia('(pointer: coarse)').matches
      || navigator.maxTouchPoints > 0;
  }

  update(): void {
    if (!this.levelComplete) {
      this.player.update();
    }
  }
}
