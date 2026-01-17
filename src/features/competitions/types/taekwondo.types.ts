// src/features/competitions/types/taekwondo.types.ts

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

export interface PoomsaeScore {
  accuracy: number;
  presentation: number;
}

export interface PoomsaeParticipant {
  participationId: number;
  rank: number | null;
  athleteName: string;
  institution: string;
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
