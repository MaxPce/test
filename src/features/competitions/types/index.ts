export interface Phase {
  phaseId: number;
  eventCategoryId: number;
  name: string;
  type: "grupo" | "eliminacion" | "repechaje";
  displayOrder?: number;
  eventCategory?: {
    eventCategoryId: number;
    categoryId: number;
    category?: {
      categoryId: number;
      name: string;
      type: string; // "individual" | "dobles" | "equipo"
      gender?: string; // "M" | "F" | "MIXTO"
      sport?: {
        sportId: number;
        name: string;
      };
    };
  };
  matches?: Match[];
  standings?: Standing[];
}

export interface Match {
  matchId: number;
  phaseId: number;
  matchNumber?: number;
  round?: string; // 'final', 'semifinal', 'cuartos', etc.
  status: "programado" | "en_curso" | "finalizado" | "cancelado";
  winnerRegistrationId?: number;
  scheduledTime?: string;
  platformNumber?: number;
  createdAt: string;
  updatedAt: string;
  phase?: Phase;
  winner?: any;
  participations?: Participation[];
  victoryType?: string | null;
}

export interface Participation {
  participationId: number;
  matchId: number;
  registrationId: number;
  corner?: "blue" | "white" | "A" | "B";
  match?: Match;
  registration?: {
    registrationId: number;
    athleteId?: number;
    teamId?: number;
    athlete?: {
      athleteId: number;
      name: string;
      institution?: {
        institutionId: number;
        name: string;
        code: string;
      };
    };
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
        teamId: number;
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
}

export interface Standing {
  standingId: number;
  phaseId: number;
  registrationId: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  scoreFor: number;
  scoreAgainst: number;
  scoreDiff: number;
  rankPosition?: number;
  phase?: Phase;
  registration?: any;
}

export interface CreatePhaseData {
  eventCategoryId: number;
  name: string;
  type: "grupo" | "eliminacion" | "repechaje";
  displayOrder?: number;
}

export interface CreateMatchData {
  phaseId: number;
  matchNumber?: number;
  round?: string;
  scheduledTime?: string;
  platformNumber?: number;
}

export interface CreateParticipationData {
  matchId: number;
  registrationId: number;
  corner?: "blue" | "white" | "A" | "B";
}

export interface UpdateMatchData {
  status?: "programado" | "en_curso" | "finalizado" | "cancelado";
  winnerRegistrationId?: number;
  scheduledTime?: string;
  platformNumber?: number;
  round?: string;
  victoryType?: string | null;
}
