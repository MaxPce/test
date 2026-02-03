// ==================== KYORUGUI ====================

export interface KyoruguiMatch {
  matchId: number;
  phaseId: number;
  matchNumber?: number;
  round?: string;
  status: "programado" | "en_curso" | "finalizado" | "cancelado";
  winnerRegistrationId?: number;
  scheduledTime?: string;
  platformNumber?: number;
  createdAt: string;
  updatedAt: string;
  participant1Score?: number | null;
  participant2Score?: number | null;
  phase?: any;
  winner?: any;
  participations?: Array<{
    participationId: number;
    matchId: number;
    registrationId: number;
    corner?: "blue" | "white";
    registration?: {
      registrationId: number;
      athleteId?: number;
      athlete?: {
        athleteId: number;
        name: string;
        institution?: {
          institutionId: number;
          name: string;
          code: string;
        };
      };
    };
  }>;
}

export interface KyoruguiScore {
  participant1Score: number;
  participant2Score: number;
  winnerRegistrationId?: number;
}

// ==================== POOMSAE - MODO GRUPOS ====================

export interface PoomsaeScore {
  accuracy: number;
  presentation: number;
}

export interface PoomsaeParticipant {
  participationId: number;
  rank: number | null;
  participantName: string;     
  isTeam: boolean;              
  participantPhoto: string | null;  
  institution: string;
  institutionLogo: string | null;
  gender: string;
  accuracy: number | null;
  presentation: number | null;
  total: number | null;
}


export interface PoomsaeScoreResponse {
  scoreId: number;
  participationId: number;
  accuracy: number | null;
  presentation: number | null;
  total: number | null;
  rank: number | null;
  createdAt: string;
  updatedAt: string;
}

// ==================== POOMSAE - MODO BRACKET (NUEVOS) ====================

export interface PoomsaeBracketScoreResponse {
  score: {
    scoreId: number;
    participationId: number;
    accuracy: number;
    presentation: number;
    total: number;
    rank?: number | null;
    createdAt: string;
    updatedAt: string;
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

export interface PoomsaeBracketMatchScores {
  matchId: number;
  matchNumber: number;
  round: string;
  status: "programado" | "en_curso" | "finalizado" | "cancelado";
  participants: Array<{
    participationId: number;
    registrationId: number;
    corner: "blue" | "white";
    participantName: string;      
    isTeam: boolean;          
    participantPhoto: string | null;  
    institution: string;
    institutionLogo: string | null;
    accuracy: number | null;
    presentation: number | null;
    total: number | null;
    isWinner: boolean;
  }>;
  winner: {
    participationId: number;
    registrationId: number;
    corner: "blue" | "white";
    participantName: string;     
    isTeam: boolean;              
    participantPhoto: string | null; 
    institution: string;
    institutionLogo: string | null;
    accuracy: number | null;
    presentation: number | null;
    total: number | null;
    isWinner: boolean;
  } | null;
}

// ==================== KYORUGUI - ROUNDS ====================

export interface KyoruguiRound {
  gameId: number;
  matchId: number;
  gameNumber: number; // 1, 2 o 3 (número del round)
  player1Id: number; // En este caso es registrationId
  player2Id: number;
  score1: number | null; // Puntos del participante 1
  score2: number | null; // Puntos del participante 2
  winnerId: number | null; // registrationId del ganador del round
  status: "pending" | "in_progress" | "completed";
  startedAt: string | null;
  completedAt: string | null;
}

export interface KyoruguiMatchWithRounds extends KyoruguiMatch {
  rounds: KyoruguiRound[];
}

export interface UpdateSingleRoundDto {
  roundNumber: number; // 1, 2 o 3
  participant1Points: number;
  participant2Points: number;
}

export interface KyoruguiRoundDto {
  roundNumber: number;
  participant1Points: number;
  participant2Points: number;
  winnerId?: number;
}

export interface UpdateKyoruguiRoundsDto {
  rounds: KyoruguiRoundDto[];
  winnerRegistrationId?: number;
}
