// ── Rondas ────────────────────────────────────────────────────────────────────

export interface ChessRound {
  chessRoundId: number;
  phaseId: number;
  name: string;       // "Rd.1", "Rd.2" ...
  sortOrder: number;
  createdAt: string;
}

export interface CreateChessRoundDto {
  phaseId: number;
  name: string;
  sortOrder?: number;
}

export interface UpdateChessRoundDto {
  name?: string;
  sortOrder?: number;
}

// ── Matches ───────────────────────────────────────────────────────────────────

export type ChessMatchResult = "1-0" | "0-1" | "½-½" | null;

export interface ChessMatchPlayer {
  phaseRegistrationId: number;
  name: string;
  institution: string;
}

export interface ChessMatch {
  chessMatchId: number;
  chessRoundId: number;
  boardNumber: number | null;
  result: ChessMatchResult;
  notes: string | null;
  white: ChessMatchPlayer;
  black: ChessMatchPlayer;
}

export interface CreateChessMatchDto {
  chessRoundId: number;
  whitePhaseRegistrationId: number;
  blackPhaseRegistrationId: number;
  boardNumber?: number;
  notes?: string;
}

export interface UpdateChessMatchDto {
  result?: ChessMatchResult;
  boardNumber?: number;
  notes?: string;
}

// ── Tabla completa ────────────────────────────────────────────────────────────

export interface ChessFullTable {
  chessRoundId: number;
  name: string;
  sortOrder: number;
  matches: ChessMatch[];
}

// ── Standings ─────────────────────────────────────────────────────────────────

export interface ChessStanding {
  phaseRegistrationId: number;
  name: string;
  institution: string;
  points: number;       // 1 victoria, 0.5 empate, 0 derrota
  gamesPlayed: number;
}

// ── Participantes ─────────────────────────────────────────────────────────────

export interface ChessParticipant {
  phaseRegistrationId: number;
  registrationId: number;
  athleteName: string;
  institutionName: string;
}
