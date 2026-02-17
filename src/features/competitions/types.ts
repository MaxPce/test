import type { PhaseFormat, MatchStatus } from "@/lib/types/common.types";
import type { EventCategory } from "@/features/events/types";
import type { Athlete, Team } from "@/features/institutions/types";

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
        sport?: {
          sportId: number;
          name: string; 
        };
      };
    };
  };

  participations?: Array<{
    participationId: number;
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
        institution?: {
          institutionId: number;
          name: string;
          code: string;
        };
        members?: Array<{
          tmId: number;
          athleteId: number;
          rol?: string;
          athlete: {
            athleteId: number;
            name: string;
            institution?: {
              institutionId: number;
              name: string;
              code: string;
            };
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

export interface Participation {
  participationId: number;
  phaseId: number;
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
