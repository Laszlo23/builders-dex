import type { DailyEvent, DailyPulse } from '../../data/dailyIntelligence';
import type { Project } from '../../types';
import type {
  DailyRadarPayload,
  RadarMover,
  RadarTrendingItem,
} from './types';

function formatDateLabel(dayKey: string): string {
  const d = new Date(`${dayKey}T12:00:00.000Z`);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function hourGreeting(now = new Date()): string {
  const h = now.getUTCHours();
  if (h < 12) return 'GOOD MORNING';
  if (h < 18) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
}

export function composeDailyRadar(input: {
  dayKey: string;
  projects: Project[];
  liveOverall: Map<string, number>;
  priorOverall: Map<string, number>;
  trending: RadarTrendingItem[];
  now?: Date;
}): DailyRadarPayload {
  const now = input.now ?? new Date();
  const movers: RadarMover[] = input.projects
    .filter((p) => p.curation.status !== 'rejected')
    .map((p) => {
      const overall =
        input.liveOverall.get(p.id) ?? p.builderScore.overall;
      const prior =
        input.priorOverall.get(p.id) ?? p.builderScore.overall;
      return {
        projectId: p.id,
        name: p.name,
        category: p.category,
        overall,
        priorOverall: prior,
        delta: overall - prior,
        curationStatus: p.curation.status,
      };
    });

  const rising = [...movers]
    .filter((m) => m.delta > 0)
    .sort((a, b) => b.delta - a.delta || b.overall - a.overall)
    .slice(0, 5);
  const falling = [...movers]
    .filter((m) => m.delta < 0)
    .sort((a, b) => a.delta - b.delta || a.overall - b.overall)
    .slice(0, 5);

  const underEvaluation = input.projects.filter(
    (p) =>
      p.curation.status === 'pending' || p.curation.status === 'reviewed',
  ).length;

  const events: DailyEvent[] = [];
  if (rising.length > 0) {
    const top = rising[0];
    events.push({
      kind: 'gained',
      text: `${rising.length} project${rising.length === 1 ? '' : 's'} gained Builder Score™ — top: ${top.name} (${top.delta >= 0 ? '+' : ''}${top.delta})`,
    });
  }
  if (falling.length > 0) {
    const top = falling[0];
    events.push({
      kind: 'lost',
      text: `${falling.length} project${falling.length === 1 ? '' : 's'} slipped — watch: ${top.name} (${top.delta})`,
    });
  }
  if (input.trending.length > 0) {
    const t = input.trending[0];
    events.push({
      kind: 'entered',
      text: `Telegram community cleared ${input.trending.length} token${input.trending.length === 1 ? '' : 's'} — lead: $${t.ticker} (${t.voteCount} votes)`,
    });
  }
  if (underEvaluation > 0) {
    events.push({
      kind: 'entered',
      text: `${underEvaluation} builder${underEvaluation === 1 ? '' : 's'} under evaluation on Genesis Radar™`,
    });
  }
  if (events.length === 0) {
    events.push({
      kind: 'entered',
      text: 'Radar quiet — no score deltas or Telegram clears yet. Check Scouts and rescan later.',
    });
  }

  const sectorBuckets = new Map<string, { sum: number; n: number }>();
  for (const m of movers) {
    const key = m.category.split('+')[0].trim() || m.category;
    const bucket = sectorBuckets.get(key) || { sum: 0, n: 0 };
    bucket.sum += m.delta;
    bucket.n += 1;
    sectorBuckets.set(key, bucket);
  }
  const marketPulse: DailyPulse[] = [...sectorBuckets.entries()]
    .map(([sector, b]) => ({
      sector,
      changePct: Math.round((b.sum / Math.max(1, b.n)) * 10) / 10,
    }))
    .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
    .slice(0, 5);

  const sources = [
    'Live Builder Score™ (GitHub-cited)',
    'Score snapshot Δ vs prior day / seed',
  ];
  if (input.trending.length > 0) sources.push('Telegram vote clears');
  if (underEvaluation > 0) sources.push('Curation queue');

  return {
    greeting: hourGreeting(now),
    title: "Today's Builder Radar",
    dateLabel: formatDateLabel(input.dayKey),
    events: events.slice(0, 6),
    marketPulse:
      marketPulse.length > 0
        ? marketPulse
        : [
            { sector: 'AI', changePct: 0 },
            { sector: 'Infrastructure', changePct: 0 },
          ],
    defaultWatchlistUpdates: Math.max(
      1,
      rising.length + input.trending.length,
    ),
    generatedAt: now.toISOString(),
    dayKey: input.dayKey,
    movers: { rising, falling },
    trending: input.trending.slice(0, 8),
    underEvaluation,
    sources,
  };
}
