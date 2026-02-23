export interface KarateScore {
  participant1Score: number;
  participant2Score: number;
  winnerRegistrationId?: number;
}

export interface KarateMatch {
  matchId: number;
  matchNumber: number;
  round?: string;
  status: string;
  participant1Score: number | null;
  participant2Score: number | null;
  winnerRegistrationId: number | null;
  phase?: {
    eventCategory?: {
      category?: {
        sport?: { name?: string };
        name?: string;
      };
    };
  };
  participations: Array<{
    participationId: number;
    registrationId: number;
    registration: {
      registrationId: number;
      athlete: {
        athleteId: number;
        name: string;
        firstName?: string;
        lastName?: string;
      };
    };
  }>;
}
