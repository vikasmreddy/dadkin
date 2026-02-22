import Phaser from 'phaser';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  TILE_SIZE,
  GRID_COLS,
  GRID_ROWS,
  TOOLBAR_HEIGHT,
} from '../config/game.config';
import { CellType, LevelCell, LevelData } from '../types/level.types';
import { saveLevel, loadLevel } from '../utils/LevelStorage';
import { createDefaultLevel, cellKey, buildCellMap } from '../utils/LevelUtils';

// Tool definitions for the toolbar
interface ToolDef {
  type: CellType | 'eraser';
  label: string;
  color: number;
}

const TOOLS: ToolDef[] = [
  { type: CellType.Platform, label: 'Plat', color: 0x8b4513 },
  { type: CellType.Spike, label: 'Spike', color: 0xff0000 },
  { type: CellType.Spring, label: 'Sprng', color: 0x00cc44 },
  { type: CellType.PlayerStart, label: 'Start', color: 0xffdd00 },
  { type: CellType.Goal, label: 'Goal', color: 0xff8800 },
  { type: 'eraser', label: 'Erase', color: 0x888888 },
];

export class EditorScene extends Phaser.Scene {
  private cellMap!: Map<string, LevelCell>;
  private levelData!: LevelData;
  private selectedTool: CellType | 'eraser' = CellType.Platform;

  // Graphics layers
  private gridGraphics!: Phaser.GameObjects.Graphics;
  private cellGraphics!: Phaser.GameObjects.Graphics;
  private hoverGraphics!: Phaser.GameObjects.Graphics;

  // Toolbar UI
  private toolHighlights: Map<string, Phaser.GameObjects.Rectangle> = new Map();

  // Play button
  private playBtn!: Phaser.GameObjects.Text;

  // Painting state
  private isPainting = false;

  constructor() {
    super({ key: 'EditorScene' });
  }

  create(): void {
    // Load saved level or create default
    const saved = loadLevel();
    this.levelData = saved ?? createDefaultLevel();
    this.cellMap = buildCellMap(this.levelData.cells);

    // Create graphics layers
    this.gridGraphics = this.add.graphics();
    this.cellGraphics = this.add.graphics();
    this.hoverGraphics = this.add.graphics();

    this.drawGrid();
    this.drawAllCells();
    this.createToolbar();
    this.createPlayButton();
    this.createHintText();
    this.setupInput();
  }

  // --- Grid drawing ---

  private drawGrid(): void {
    const g = this.gridGraphics;
    g.clear();
    g.lineStyle(1, 0x444466, 0.3);

    const gridHeight = GRID_ROWS * TILE_SIZE;

    // Vertical lines
    for (let col = 0; col <= GRID_COLS; col++) {
      const x = col * TILE_SIZE;
      g.moveTo(x, 0);
      g.lineTo(x, gridHeight);
    }
    // Horizontal lines
    for (let row = 0; row <= GRID_ROWS; row++) {
      const y = row * TILE_SIZE;
      g.moveTo(0, y);
      g.lineTo(GRID_COLS * TILE_SIZE, y);
    }
    g.strokePath();
  }

  // --- Cell rendering ---

  private drawAllCells(): void {
    const g = this.cellGraphics;
    g.clear();

    for (const cell of this.cellMap.values()) {
      this.drawCell(g, cell);
    }
  }

  private drawCell(g: Phaser.GameObjects.Graphics, cell: LevelCell): void {
    const x = cell.col * TILE_SIZE;
    const y = cell.row * TILE_SIZE;

    switch (cell.type) {
      case CellType.Platform:
        g.fillStyle(0x8b4513);
        g.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        break;
      case CellType.Spike:
        g.fillStyle(0xff0000);
        g.fillTriangle(
          x, y + TILE_SIZE,
          x + TILE_SIZE, y + TILE_SIZE,
          x + TILE_SIZE / 2, y
        );
        break;
      case CellType.Spring:
        g.fillStyle(0x00cc44);
        g.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        break;
      case CellType.PlayerStart:
        // Yellow dot
        g.fillStyle(0xffdd00);
        g.fillCircle(x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE / 3);
        break;
      case CellType.Goal:
        // Orange square
        g.fillStyle(0xff8800);
        g.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        break;
    }
  }

  // --- Toolbar ---

  private createToolbar(): void {
    const toolbarY = GAME_HEIGHT - TOOLBAR_HEIGHT;

    // Toolbar background
    this.add.rectangle(
      GAME_WIDTH / 2, toolbarY + TOOLBAR_HEIGHT / 2,
      GAME_WIDTH, TOOLBAR_HEIGHT,
      0x222233
    );

    const btnSize = 20;
    const gap = 6;
    const startX = 10;

    for (let i = 0; i < TOOLS.length; i++) {
      const tool = TOOLS[i];
      const bx = startX + i * (btnSize + gap) + btnSize / 2;
      const by = toolbarY + TOOLBAR_HEIGHT / 2;

      // Highlight border (shown for selected tool)
      const highlight = this.add.rectangle(bx, by, btnSize + 4, btnSize + 4, 0xffffff, 0);
      highlight.setStrokeStyle(2, 0xffffff);
      highlight.setVisible(tool.type === this.selectedTool);
      this.toolHighlights.set(String(tool.type), highlight);

      // Color swatch
      const swatch = this.add.rectangle(bx, by, btnSize, btnSize, tool.color);
      swatch.setInteractive({ useHandCursor: true });

      // Label below
      this.add.text(bx, by + btnSize / 2 + 2, tool.label, {
        fontSize: '6px',
        color: '#aaaaaa',
        fontFamily: 'Arial',
      }).setOrigin(0.5, 0);

      swatch.on('pointerdown', () => {
        this.selectTool(tool.type);
      });
    }
  }

  private selectTool(type: CellType | 'eraser'): void {
    this.selectedTool = type;

    // Update highlights
    for (const [key, rect] of this.toolHighlights) {
      rect.setVisible(key === String(type));
    }
  }

  // --- Play button ---

  private createPlayButton(): void {
    const toolbarY = GAME_HEIGHT - TOOLBAR_HEIGHT;

    this.playBtn = this.add.text(GAME_WIDTH - 40, toolbarY + TOOLBAR_HEIGHT / 2, 'Play', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'Arial',
      backgroundColor: '#226622',
      padding: { x: 6, y: 3 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.playBtn.on('pointerdown', () => {
      if (!this.hasSpawn()) return;
      this.syncCellsToLevelData();
      saveLevel(this.levelData);
      this.scene.start('GameScene', { level: this.levelData, fromEditor: true });
    });

    this.updatePlayButton();
  }

  private updatePlayButton(): void {
    if (this.hasSpawn()) {
      this.playBtn.setAlpha(1);
    } else {
      this.playBtn.setAlpha(0.4);
    }
  }

  private hasSpawn(): boolean {
    for (const cell of this.cellMap.values()) {
      if (cell.type === CellType.PlayerStart) return true;
    }
    return false;
  }

  // --- Hint text ---

  private createHintText(): void {
    this.add.text(GAME_WIDTH / 2, 8, 'Click to place blocks!', {
      fontSize: '10px',
      color: '#88ff88',
      fontFamily: 'Arial',
    }).setOrigin(0.5, 0);
  }

  // --- Input handling ---

  private setupInput(): void {
    const gridHeight = GRID_ROWS * TILE_SIZE;

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y >= gridHeight) return; // ignore clicks in toolbar area
      this.isPainting = true;
      this.paintAt(pointer.x, pointer.y);
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.drawHover(pointer.x, pointer.y);
      if (this.isPainting && pointer.y < gridHeight) {
        this.paintAt(pointer.x, pointer.y);
      }
    });

    this.input.on('pointerup', () => {
      this.isPainting = false;
    });
  }

  private paintAt(px: number, py: number): void {
    const col = Math.floor(px / TILE_SIZE);
    const row = Math.floor(py / TILE_SIZE);

    if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return;

    const key = cellKey(col, row);

    if (this.selectedTool === 'eraser') {
      this.cellMap.delete(key);
    } else {
      // Enforce single-instance rules for PlayerStart and Goal
      if (this.selectedTool === CellType.PlayerStart || this.selectedTool === CellType.Goal) {
        // Remove any existing cell of the same type
        for (const [k, c] of this.cellMap) {
          if (c.type === this.selectedTool) {
            this.cellMap.delete(k);
          }
        }
      }

      this.cellMap.set(key, { col, row, type: this.selectedTool });
    }

    this.drawAllCells();
    this.updatePlayButton();
    this.autoSave();
  }

  private drawHover(px: number, py: number): void {
    const g = this.hoverGraphics;
    g.clear();

    const col = Math.floor(px / TILE_SIZE);
    const row = Math.floor(py / TILE_SIZE);
    const gridHeight = GRID_ROWS * TILE_SIZE;

    if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS || py >= gridHeight) return;

    g.lineStyle(2, 0xffffff, 0.5);
    g.strokeRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  // --- Save helpers ---

  private syncCellsToLevelData(): void {
    this.levelData.cells = Array.from(this.cellMap.values());
  }

  private autoSave(): void {
    this.syncCellsToLevelData();
    saveLevel(this.levelData);
  }
}
