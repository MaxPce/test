// src/types/judoMedalTable.ts (o donde tengas tus types)

export interface JudoMedalRow {
  rank: number;
  institutionId: number;
  institutionName: string;
  gold: number;
  silver: number;
  bronze: number;
  fifth: number;
  seventh: number;
}

export interface JudoMedalSummaryResponse {
  general: JudoMedalRow[];
}