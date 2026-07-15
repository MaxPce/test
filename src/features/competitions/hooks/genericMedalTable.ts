// src/features/competitions/types/genericMedalTable.ts

export interface GenericMedalRow {
  rank: number;
  institutionId: number;
  institutionName: string;
  institutionLogoUrl: string | null;
  gold: number;
  silver: number;
  bronze: number;
}

export interface GenericMedalSummaryResponse {
  general: GenericMedalRow[];
}