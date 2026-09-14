/**
 * Discovery Streak — localStorage-backed daily discovery tracking
 */

const STORAGE_KEY = 'builders-dex-discovery-streak';

export interface DiscoveryStreakData {
  lastDiscoveryDate: string; // ISO date string (YYYY-MM-DD)
  currentStreak: number;
  bestStreak: number;
  totalDiscoveries: number;
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function getStreakData(): DiscoveryStreakData {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return {
      lastDiscoveryDate: '',
      currentStreak: 0,
      bestStreak: 0,
      totalDiscoveries: 0,
    };
  }
  try {
    return JSON.parse(stored);
  } catch {
    return {
      lastDiscoveryDate: '',
      currentStreak: 0,
      bestStreak: 0,
      totalDiscoveries: 0,
    };
  }
}

function saveStreakData(data: DiscoveryStreakData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function calculateDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function recordDiscovery(): DiscoveryStreakData {
  const today = getTodayDateString();
  const data = getStreakData();

  if (data.lastDiscoveryDate === today) {
    return data;
  }

  if (!data.lastDiscoveryDate) {
    data.currentStreak = 1;
    data.bestStreak = 1;
  } else {
    const daysSince = calculateDaysDifference(data.lastDiscoveryDate, today);
    if (daysSince === 1) {
      data.currentStreak += 1;
      data.bestStreak = Math.max(data.bestStreak, data.currentStreak);
    } else if (daysSince > 1) {
      data.currentStreak = 1;
    }
  }

  data.lastDiscoveryDate = today;
  data.totalDiscoveries += 1;

  saveStreakData(data);
  return data;
}

export function getCurrentStreak(): DiscoveryStreakData {
  const data = getStreakData();
  const today = getTodayDateString();

  if (data.lastDiscoveryDate && data.lastDiscoveryDate !== today) {
    const daysSince = calculateDaysDifference(data.lastDiscoveryDate, today);
    if (daysSince > 1) {
      data.currentStreak = 0;
    }
  }

  return data;
}
