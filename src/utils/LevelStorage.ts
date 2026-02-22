import { LevelData } from '../types/level.types';

const STORAGE_KEY = 'dadkin_level';

export function saveLevel(level: LevelData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(level));
  } catch (e) {
    console.warn('Could not save level:', e);
  }
}

export function loadLevel(): LevelData | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as LevelData;
  } catch (e) {
    console.warn('Could not load level:', e);
    return null;
  }
}
