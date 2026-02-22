export enum CellType {
  Platform = 'platform',
  Spike = 'spike',
  Spring = 'spring',
  PlayerStart = 'player_start',
  Goal = 'goal',
}

export interface LevelCell {
  col: number;
  row: number;
  type: CellType;
}

export interface LevelData {
  name: string;
  gridCols: number;
  gridRows: number;
  cells: LevelCell[];
  version: number;
}
