// ==================== ATLETISMO ====================

export interface AthleticsParticipant {
  participationId: number;
  rank: number | null;
  participantName: string;
  isTeam: boolean;
  participantPhoto: string | null;
  institution: string;
  institutionLogo: string | null;
  gender: string;
  lane: number | null;       // Número de calle/carril (si aplica)
  time: string | null;       // Formato "MM:SS.cc" o "SS.cc" o "H:MM:SS.cc"
  timeMs: number | null;     // Milisegundos para ordenar
  mark: string | null;       // Para pruebas de campo: "8.95m", "2.40m", etc.
}

export interface UpdateAthleticsTimeDto {
  time?: string | null;       // Para pruebas de pista
  mark?: string | null;       // Para pruebas de campo (saltos, lanzamientos)
  lane?: number | null;
}
