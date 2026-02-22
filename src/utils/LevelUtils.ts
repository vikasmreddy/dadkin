import { CellType, LevelCell, LevelData } from '../types/level.types';
import { GRID_COLS, GRID_ROWS } from '../config/game.config';

export function cellKey(col: number, row: number): string {
  return `${col},${row}`;
}

export function buildCellMap(cells: LevelCell[]): Map<string, LevelCell> {
  const map = new Map<string, LevelCell>();
  for (const cell of cells) {
    map.set(cellKey(cell.col, cell.row), cell);
  }
  return map;
}

export function createDefaultLevel(): LevelData {
  const cells: LevelCell[] = [];

  // Floor across the bottom row
  for (let col = 0; col < GRID_COLS; col++) {
    cells.push({ col, row: GRID_ROWS - 1, type: CellType.Platform });
  }

  // Player start near the left
  cells.push({ col: 2, row: GRID_ROWS - 2, type: CellType.PlayerStart });

  // Goal near the right
  cells.push({ col: GRID_COLS - 3, row: GRID_ROWS - 2, type: CellType.Goal });

  return {
    name: 'My Level',
    gridCols: GRID_COLS,
    gridRows: GRID_ROWS,
    cells,
    version: 1,
  };
}
