import type { DailyIntelligenceBrief } from '../../data/dailyIntelligence';

export type RadarMover = {
  projectId: string;
  name: string;
  category: string;
  overall: number;
  priorOverall: number;
  delta: number;
  curationStatus: string;
};

export type RadarTrendingItem = {
  ticker: string;
  name: string;
  voteCount: number;
  chatTitle: string;
};

export type DailyRadarPayload = DailyIntelligenceBrief & {
  generatedAt: string;
  dayKey: string;
  movers: {
    rising: RadarMover[];
    falling: RadarMover[];
  };
  trending: RadarTrendingItem[];
  underEvaluation: number;
  sources: string[];
};
