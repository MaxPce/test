import type { PhaseFormat, MatchStatus } from "@/lib/types/common.types";
import type { EventCategory } from "@/features/events/types";
import type { Athlete, Team } from "@/features/institutions/types";

export interface Phase {
  phaseId: number;
  eventCategoryId: number;
  name: string;
  format: PhaseFormat;
  status: "pendiente" | "en_curso" | "finalizado";
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  eventCategory?: EventCategory;
  matches?: Match[];
  participations?: Participation[];
}

export interface CreatePhaseData {
  eventCategoryId: number;
  name: string;
  format: PhaseFormat;
  status: "pendiente" | "en_curso" | "finalizado";
  startDate?: string;
  endDate?: string;
}

export interface UpdatePhaseData {
  name?: string;
  format?: PhaseFormat;
  status?: "pendiente" | "en_curso" | "finalizado";
  startDate?: string;
  endDate?: string;
}

export interface Match {
  matchId: number;
  phaseId: number;
  participantA?: number;
  participantB?: number;
  winnerParticipantId?: number;
  scoreA?: number;
  scoreB?: number;
  status: MatchStatus;
  round?: number;
  matchNumber?: number;
  nextMatchId?: number;
  scheduledTime?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  phase?: Phase;
  participantAData?: Participation;
  participantBData?: Participation;
  winnerData?: Participation;
}

export interface CreateMatchData {
  phaseId: number;
  participantA?: number;
  participantB?: number;
  round?: number;
  matchNumber?: number;
  nextMatchId?: number;
  scheduledTime?: string;
  location?: string;
}

export interface UpdateMatchData {
  participantA?: number;
  participantB?: number;
  winnerParticipantId?: number;
  scoreA?: number;
  scoreB?: number;
  status?: MatchStatus;
  scheduledTime?: string;
  location?: string;
}

export interface Participation {
  participationId: number;
  phaseId: number;
  athleteId?: number;
  teamId?: number;
  wins: number;
  losses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  createdAt: string;
  updatedAt: string;
  phase?: Phase;
  athlete?: Athlete;
  team?: Team;
}

export interface CreateParticipationData {
  phaseId: number;
  athleteId?: number;
  teamId?: number;
}

export interface BulkParticipationsData {
  phaseId: number;
  participantIds: number[];
  isTeam: boolean;
}

export interface InitializeBracketData {
  phaseId: number;
}

export interface InitializeRoundRobinData {
  phaseId: number;
}

export interface StandingsRow {
  position: number;
  participation: Participation;
  played: number;
  goalDifference: number;
}
