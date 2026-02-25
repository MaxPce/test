// ==================== NATACIÓN ====================

export interface SwimmingParticipant {
  participationId: number;
  rank: number | null;
  participantName: string;
  isTeam: boolean;
  participantPhoto: string | null;
  institution: string;
  institutionLogo: string | null;
  gender: string;
  lane: number | null;       // Número de calle
  time: string | null;       // Formato "MM:SS.cc" o "SS.cc"
  timeMs: number | null;     // Milisegundos para ordenar
}

export interface UpdateSwimmingTimeDto {
  time: string;       // "MM:SS.cc" o "SS.cc"
  lane?: number | null;
}
