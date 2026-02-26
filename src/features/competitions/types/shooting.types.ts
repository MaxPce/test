export interface ShootingScore {
  shootingScoreId?: number;
  participationId: number;
  series: number[];
  total: number | null;
  dns: boolean;
  rank: number | null;
}

export interface ShootingParticipant {
  participationId: number;
  participantName: string;
  isTeam: boolean;
  institution: string;
  institutionLogo: string | null;
  gender: string;
  series: number[];
  total: number | null;
  dns: boolean;
  rank: number | null;
}

// Número de series por modalidad según ISSF
export const SHOOTING_SERIES_COUNT: Record<string, number> = {
  'rifle de aire 10 metros': 6,
  'pistola de aire 10 metros': 6,
  'carabina de quebrar 10 metros': 6,
};

export const getSeriesCount = (sportName: string): number => {
  const lower = sportName.toLowerCase();
  for (const [key, count] of Object.entries(SHOOTING_SERIES_COUNT)) {
    if (lower.includes(key)) return count;
  }
  return 6; // default
};
