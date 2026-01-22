export interface JudoScore {
  participant1Score: number;
  participant2Score: number;
  winnerRegistrationId?: number;
}

export interface JudoMatch {
  matchId: number;
  matchNumber: number;
  status: string;
  participant1Score: number | null;
  participant2Score: number | null;
  winnerRegistrationId: number | null;
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
