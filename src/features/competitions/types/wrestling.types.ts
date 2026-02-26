export interface WrestlingMatch {
  matchId: number;
  matchNumber?: number;
  status: string; // "programado" | "en_curso" | "finalizado"
  round?: string;
  scheduledTime?: string;
  platformNumber?: number;
  winnerRegistrationId?: number | null;
  participant1Score?: number | null; // TP participante 1
  participant2Score?: number | null; // TP participante 2
  victoryType?: WrestlingVictoryType;
  participations?: Array<{
    participationId: number;
    registrationId: number;
    registration?: {
      registrationId: number;
      athlete?: {
        name: string;
        photoUrl?: string;
        institution?: { name: string; logoUrl?: string };
      };
    };
  }>;
}

export type WrestlingVictoryType =
  | "VFA"
  | "VSU"
  | "VSU1"
  | "VPO"
  | "VCA"
  | null;
