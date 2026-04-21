

// src/types/score-tables.types.ts

export interface ScoreRow {
  rank: number;
  institutionId: number;
  institutionName: string;
  points: number;
  gold: number;
  silver: number;
  bronze: number;
}

export interface ScoreSummaryResponse {
  general: ScoreRow[];
  damas: ScoreRow[];
  varones: ScoreRow[];
  noveles: ScoreRow[];
  avanzados: ScoreRow[];
}

export type ScoreTableKey = keyof ScoreSummaryResponse;

export interface ScoreTab {
  key: ScoreTableKey;
  label: string;
}