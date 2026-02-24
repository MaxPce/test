// ──────────────────────────────────────────────────────────────
//  WUSHU — TYPES
//  Sanda  (combate 1v1)   → usa score numérico simple
//  Taolu  (formas)        → usa accuracy + presentation (igual que Poomsae)
// ──────────────────────────────────────────────────────────────

// ── Sanda (combate 1v1) ──────────────────────────────────────

export interface WushuSandaScore {
  participant1Score: number;
  participant2Score: number;
  winnerRegistrationId?: number;
}

export interface WushuSandaMatch {
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

// ── Taolu (formas — clon de Poomsae) ─────────────────────────

export interface WushuTaoluScore {
  accuracy: number | string;
  presentation: number | string;
}

export interface WushuTaoluParticipant {
  participationId: number;
  participantName: string;
  isTeam: boolean;
  participantPhoto: string | null;
  institution: string;
  institutionLogo: string | null;
  gender: string;
  accuracy: number | null;
  presentation: number | null;
  total: number | null;
  rank: number | null;
}

// Respuesta del backend al actualizar score en modo bracket
export interface WushuTaoluBracketScoreResponse {
  score: {
    scoreId: number;
    participationId: number;
    accuracy: number;
    presentation: number;
    total: number;
    rank?: number | null;
  };
  matchFinalized: boolean;
  winner?: {
    participationId: number;
    registrationId: number;
    total: number;
  };
  advancedToNextRound: boolean;
  message: string;
}

// Un participante dentro del match en modo bracket (para el GET de scores)
export interface WushuTaoloBracketParticipant {
  participationId: number;
  registrationId: number;
  corner?: string;
  participantName: string;
  isTeam: boolean;
  participantPhoto: string | null;
  institution: string;
  institutionLogo: string | null;
  accuracy: number | null;
  presentation: number | null;
  total: number | null;
  isWinner: boolean;
}

// Respuesta del GET bracket/matches/:matchId/scores
export interface WushuTaoluBracketMatchScores {
  matchId: number;
  matchNumber?: number;
  round?: number;
  status: string;
  participants: WushuTaoloBracketParticipant[];
  winner: WushuTaoloBracketParticipant | null;
}
