import { apiClient } from "@/lib/api/client";

export interface Athlete {
  athleteId: number;
  name: string;
  institution: {
    institutionId: number;
    name: string;
    code: string;
  };
}
export interface GameSet {
  setNumber: number;
  player1Score: number;
  player2Score: number;
  winnerId?: number | null;
}

export interface MatchLineup {
  lineupId: number;
  participationId: number;
  athleteId: number;
  lineupOrder: number;
  isSubstitute: boolean;
  athlete: Athlete;
}

export interface LineupData {
  participation: {
    participationId: number;
    registration: {
      registrationId: number;
      team: {
        members: { tmId: number; athleteId: number; rol?: string; athlete: { athleteId: number; name: string; institution?: { institutionId: number; name: string; code: string; }; }; }[] | undefined;
        teamId: number;
        name: string;
        institution: {
          name: string;
          code: string;
        };
      };
    };
  };
  lineups: MatchLineup[];
  teamName: string;
  institution: string;
  hasLineup: boolean;
}

export interface MatchGame {
  gameId: number;
  matchId: number;
  gameNumber: number;
  player1Id: number;
  player2Id: number;
  sets: GameSet[] | null;
  score1: number | null;
  score2: number | null;
  winnerId: number | null;
  status: "pending" | "in_progress" | "completed";
  startedAt: string | null;
  completedAt: string | null;
  player1: Athlete;
  player2: Athlete;
  winner: Athlete | null;
}

export interface MatchResult {
  team1: {
    participation: any;
    teamName: string;
    wins: number;
    lineups: MatchLineup[];
  };
  team2: {
    participation: any;
    teamName: string;
    wins: number;
    lineups: MatchLineup[];
  };
  games: MatchGame[];
  isComplete: boolean;
  winner: any | null;
  score: string;
}

export interface SetLineupDto {
  lineups: Array<{
    athleteId: number;
    lineupOrder: number;
    isSubstitute: boolean;
  }>;
}

export interface UpdateGameDto {
  sets?: GameSet[];
  score1?: number;
  score2?: number;
  status?: "pending" | "in_progress" | "completed";
}

// ==================== API FUNCTIONS ====================

export const tableTennisApi = {
  /**
   * Configurar lineup de un equipo
   */
  setLineup: async (participationId: number, data: SetLineupDto) => {
    const response = await apiClient.post(
      `/competitions/participations/${participationId}/lineup`,
      data
    );
    return response.data;
  },

  /**
   * Obtener lineups de un match
   */
  getMatchLineups: async (matchId: number): Promise<LineupData[]> => {
    const response = await apiClient.get(
      `/competitions/matches/${matchId}/lineups`
    );
    return response.data;
  },

  /**
   * Generar juegos automáticamente
   */
  generateGames: async (matchId: number) => {
    const response = await apiClient.post(
      `/competitions/matches/${matchId}/generate-games`
    );
    return response.data;
  },

  /**
   * Obtener juegos de un match
   */
  getMatchGames: async (matchId: number): Promise<MatchGame[]> => {
    const response = await apiClient.get(
      `/competitions/matches/${matchId}/games`
    );
    return response.data;
  },

  /**
   * Actualizar resultado de un juego
   */
  updateGameResult: async (gameId: number, data: UpdateGameDto) => {
    const response = await apiClient.patch(
      `/competitions/games/${gameId}`,
      data
    );
    return response.data;
  },

  /**
   * Obtener detalles completos del match
   */
  getMatchDetails: async (matchId: number) => {
    const response = await apiClient.get(
      `/competitions/matches/${matchId}/table-tennis`
    );
    return response.data;
  },

  /**
   * Calcular resultado del match
   */
  getMatchResult: async (matchId: number): Promise<MatchResult> => {
    const response = await apiClient.get(
      `/competitions/matches/${matchId}/result`
    );
    return response.data;
  },

  finalizeMatch: async (matchId: number): Promise<any> => {
    const response = await apiClient.patch(
      `/competitions/matches/${matchId}/finalize`
    );
    return response.data;
  },

  reopenMatch: async (matchId: number): Promise<any> => {
    const response = await apiClient.patch(
      `/competitions/matches/${matchId}/reopen`
    );
    return response.data;
  },

  setWalkover: async (
    matchId: number, 
    winnerRegistrationId: number, 
    reason?: string
  ) => {
    const response = await apiClient.post(
      `/competitions/table-tennis/matches/${matchId}/walkover`,
      { winnerRegistrationId, reason }
    );
    return response.data;
  },
};
