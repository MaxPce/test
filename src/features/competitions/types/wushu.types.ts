// ──────────────────────────────────────────────────────────────
//  WUSHU — TYPES
//  Nota: TypeORM + MySQL devuelve DECIMAL como string en JSON,
//        por eso los campos numéricos aceptan también string.
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

// ── Taolu (formas — jueces B/A) ───────────────────────────────

// DTO que se envía al PATCH /participations/:id/score (modo grupos)
export interface WushuTaoluScore {
  total: number;
}


// Participante en la tabla de grupos
// Los campos decimales aceptan string porque MySQL/TypeORM
// serializa DECIMAL como string en la respuesta JSON.
export interface WushuTaoluParticipant {
  participationId: number;
  participantName: string;
  isTeam: boolean;
  participantPhoto: string | null;
  institution: string;
  institutionLogo: string | null;
  gender: string;
  total: number | string | null;
  rank: number | null;
}


// Respuesta del backend al actualizar score en modo bracket
export interface WushuTaoluBracketScoreResponse {
  score: {
    scoreId: number;
    participationId: number;
    accuracy:     number | string;
    presentation: number | string;
    total:        number | string;
    rank?: number | null;
  };
  matchFinalized: boolean;
  winner?: {
    participationId: number;
    registrationId: number;
    total: number | string;
  };
  advancedToNextRound: boolean;
  message: string;
}

// Participante dentro del match en modo bracket
export interface WushuTaoloBracketParticipant {
  participationId: number;
  registrationId: number;
  corner?: string;
  participantName: string;
  isTeam: boolean;
  participantPhoto: string | null;
  institution: string;
  institutionLogo: string | null;
  accuracy:     number | string | null;
  presentation: number | string | null;
  total:        number | string | null;
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

// Tipo para el modo BRACKET (accuracy + presentation, sin jueces B/A)
export interface WushuTaoluBracketScore {
  accuracy: number;
  presentation: number;
}