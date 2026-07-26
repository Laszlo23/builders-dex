import type { DailyRadarPayload } from './types';

export async function fetchDailyRadar(): Promise<DailyRadarPayload | null> {
  const res = await fetch('/api/daily-radar');
  if (!res.ok) return null;
  return (await res.json()) as DailyRadarPayload;
}
