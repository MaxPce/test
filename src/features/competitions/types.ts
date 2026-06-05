import type { PhaseFormat, MatchStatus } from "@/lib/types/common.types";
import type { EventCategory } from "@/features/events/types";
import type { Athlete, Team } from "@/features/institutions/types";

// ─── Enums (espejo del backend) ─────────────────────────────────────────────────

export type PhaseGender = "damas" | "varones" | "mixto";
export type PhaseLevel  = "noveles" | "avanzados";
export type Corner = 'blue' | 'white' | 'A' | 'B';

// ─── GroupStanding ─────────────────────────────────────────────────────

export interface GroupStanding {
  groupStandingId: number;
  phaseId: number;
  registrationId: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDifference: number;
  points: number;
  qualified: boolean;
  finalRank: number | null;
  registration?: {
    registrationId: number;
    athlete?: {
      athleteId: number;
      name: string;
      institution?: {
        institutionId: number;
        name: string;
        logoUrl?: string;
      };
    };
    team?: {
      teamId: number;
      name: string;
      institution?: {
        institutionId: number;
        name: string;
        logoUrl?: string;
      };
    };
  };
}

// ─── Phase ──────────────────────────────────────────────────────────────────────

export interface Phase {
  type: string;
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
  gender?:  PhaseGender | null;
  level?:   PhaseLevel  | null;
  isRelay?: boolean;
  parentPhaseId?: number | null;
  groupLabel?: string | null;
  qualifiersCount?: number | null;
  subPhases?: Phase[];
  groupStandings?: GroupStanding[]; 
}

// ─── CreatePhaseData ─────────────────────────────────────────────────────────────

export interface CreatePhaseData {
  eventCategoryId: number;
  name: string;
  type?: string;
  format?: PhaseFormat;
  status?: "pendiente" | "en_curso" | "finalizado";
  startDate?: string;
  endDate?: string;
  parentPhaseId?: number | null;
  groupLabel?: string | null;
  qualifiersCount?: number | null;
}

export interface UpdatePhaseData {
  name?: string;
  format?: PhaseFormat;
  status?: "pendiente" | "en_curso" | "finalizado";
  startDate?: string;
  endDate?: string;
}

// ─── Match ───────────────────────────────────────────────────────────────────────

export interface Match {
  matchId: number;
  phaseId: number;
  participantA?: number;
  participantB?: number;
  winnerParticipantId?: number;
  scoreA?: number;
  scoreB?: number;
  participant1Score?: number;
  participant2Score?: number;
  participant1Accuracy?: number;
  participant1Presentation?: number;
  participant2Accuracy?: number;
  participant2Presentation?: number;
  status: MatchStatus;
  round?: number;
  matchNumber?: number;
  nextMatchId?: number;
  scheduledTime?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  phase?: {
    phaseId: number;
    name: string;
    eventCategoryId: number;
    eventCategory?: {
      eventCategoryId: number;
      category?: {
        categoryId: number;
        name: string;
        type: string;
        sport?: { sportId: number; name: string };
      };
    };
  };
  participations?: Array<{
    participationId: number;
    corner?: Corner;
    phaseId: number;
    athleteId?: number;
    teamId?: number;
    registrationId?: number;
    registration?: {
      registrationId: number;
      athleteId?: number;
      teamId?: number;
      athlete?: Athlete;
      team?: {
        teamId: number;
        name: string;
        institution?: { institutionId: number; name: string; code: string };
        members?: Array<{
          tmId: number;
          athleteId: number;
          rol?: string;
          athlete: {
            athleteId: number;
            name: string;
            institution?: { institutionId: number; name: string; code: string };
          };
        }>;
      };
    };
  }>;
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

// ─── Participation ───────────────────────────────────────────────────────────────

export interface Participation {
  participationId: number;
  phaseId: number;
  corner?: Corner;
  athleteId?: number;
  teamId?: number;
  registrationId?: number;
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
  registration?: {
    registrationId: number;
    athleteId?: number;
    teamId?: number;
    athlete?: Athlete;
    team?: Team;
  };
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

export interface InitializeBracketData    { phaseId: number }
export interface InitializeRoundRobinData { phaseId: number }

export interface StandingsRow {
  position: number;
  participation: Participation;
  played: number;
  goalDifference: number;
}

export interface AvailableRegistration {
  registrationId: number;
  displayName: string;
}