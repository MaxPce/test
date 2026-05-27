// ─── GroupStanding  ─────────────────────────────────────────────────────

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
  phaseId: number;
  eventCategoryId: number;
  name: string;
  type: string;
  displayOrder?: number;
  // ── Campos de fase de grupos ─────────────────────────────────────
  parentPhaseId?: number | null;
  groupLabel?: string | null;
  qualifiersCount?: number | null;
  subPhases?: Phase[];
  groupStandings?: GroupStanding[];
  // ────────────────────────────────────────────────────────────────
  eventCategory?: {
    eventCategoryId: number;
    categoryId: number;
    category?: {
      categoryId: number;
      name: string;
      type: string;
      gender?: string;
      sport?: {
        sportId: number;
        name: string;
      };
    };
  };
  matches?: Match[];
  standings?: Standing[];
}

// ─── Match ───────────────────────────────────────────────────────────────────────

export interface Match {
  matchId: number;
  phaseId: number;
  matchNumber?: number;
  round?: string;
  status: "programado" | "en_curso" | "finalizado" | "cancelado";
  winnerRegistrationId?: number;
  participant1Score?: number | null;
  participant2Score?: number | null;
  scheduledTime?: string;
  platformNumber?: number;
  createdAt: string;
  updatedAt: string;
  phase?: Phase;
  winner?: any;
  participations?: Participation[];
  victoryType?: string | null;
}

// ─── Participation ───────────────────────────────────────────────────────────────

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
        logoUrl?: string;
      };
    };
    team?: {
      teamId: number;
      name: string;
      institution?: {
        institutionId: number;
        name: string;
        code: string;
        logoUrl?: string;
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

// ─── Standing ────────────────────────────────────────────────────────────────────

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
  manualRankPosition?: number | null;
  phase?: Phase;
  registration?: any;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────────

export interface CreatePhaseData {
  eventCategoryId: number;
  name: string;
  type: string;
  displayOrder?: number;
  parentPhaseId?: number | null;
  groupLabel?: string | null;
  qualifiersCount?: number | null;
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