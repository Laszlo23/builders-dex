/**
 * Daily Scout Ritual — deterministic daily project selection + streak tracking
 */

import { Project } from '../types';

const STORAGE_KEY = 'builders-dex-scout-ritual';

export interface ScoutRitualData {
  lastRitualDate: string; // ISO date string (YYYY-MM-DD)
  consecutiveDays: number;
  bestStreak: number;
  totalRituals: number;
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function getRitualData(): ScoutRitualData {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return {
      lastRitualDate: '',
      consecutiveDays: 0,
      bestStreak: 0,
      totalRituals: 0,
    };
  }
  try {
    return JSON.parse(stored);
  } catch {
    return {
      lastRitualDate: '',
      consecutiveDays: 0,
      bestStreak: 0,
      totalRituals: 0,
    };
  }
}

function saveRitualData(data: ScoutRitualData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function calculateDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function getDailyProject(projects: Project[]): Project | null {
  const curated = projects.filter((p) => p.curation.status === 'curated');
  if (curated.length === 0) return null;

  const today = getTodayDateString();
  const dateHash = today.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0);
  const index = dateHash % curated.length;

  return curated[index];
}

export function recordRitualCompletion(): ScoutRitualData {
  const today = getTodayDateString();
  const data = getRitualData();

  if (data.lastRitualDate === today) {
    return data;
  }

  if (!data.lastRitualDate) {
    data.consecutiveDays = 1;
    data.bestStreak = 1;
  } else {
    const daysSince = calculateDaysDifference(data.lastRitualDate, today);
    if (daysSince === 1) {
      data.consecutiveDays += 1;
      data.bestStreak = Math.max(data.bestStreak, data.consecutiveDays);
    } else if (daysSince > 1) {
      data.consecutiveDays = 1;
    }
  }

  data.lastRitualDate = today;
  data.totalRituals += 1;

  saveRitualData(data);
  return data;
}

export function getCurrentRitualStreak(): ScoutRitualData {
  const data = getRitualData();
  const today = getTodayDateString();

  if (data.lastRitualDate && data.lastRitualDate !== today) {
    const daysSince = calculateDaysDifference(data.lastRitualDate, today);
    if (daysSince > 1) {
      data.consecutiveDays = 0;
    }
  }

  return data;
}
