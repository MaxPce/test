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
  lane: number | null; // Número de calle/carril (si aplica)
  time: string | null; // Formato "MM:SS.cc" o "SS.cc" o "H:MM:SS.cc"
  timeMs: number | null; // Milisegundos para ordenar
  mark: string | null; // Para pruebas de campo: "8.95m", "2.40m", etc.
}

export interface UpdateAthleticsTimeDto {
  time?: string | null; // Para pruebas de pista
  mark?: string | null; // Para pruebas de campo (saltos, lanzamientos)
  lane?: number | null;
}

// Agrega estos tipos a los existentes:

export interface SectionEntry {
  entryId: number;
  athleticsSectionId: number;
  sectionName: string;
  lane: number | null;
  time: string | null;
  wind: number | null;
  notes: string | null;
  isDirty?: boolean;
}

export interface AthleticsRow {
  phaseRegistrationId: number;
  registrationId: number;
  athleteName: string;
  institutionName: string;
  isTeam: boolean;
  athleticsResultId: number | null;
  time: string | null;
  sections: SectionEntry[];
}

export interface AthlSection {
  athleticsSectionId: number;
  phaseId: number;
  name: string;
  sortOrder: number;
  wind: number | null;
}

export interface AssignSectionEntriesDto {
  athleticsSectionId: number;
  toAdd: number[];
  toRemove: number[];
}

export interface UpsertSectionEntryDto {
  athleticsSectionId: number;
  phaseRegistrationId: number;
  lane?: number | null;
  time?: string | null;
  wind?: number | null;
  notes?: string | null;
}

export interface CreateSectionDto {
  phaseId: number;
  name: string;
  sortOrder?: number;
}

export interface UpdateSectionDto {
  name?: string;
  wind?: number | null;
  sortOrder?: number;
}

export interface AttemptResult {
  athleticsResultId: number | null;
  attemptNumber: number;
  distanceValue: number | null;
  isValid: boolean;
  wind: number | null;
  height: number | null;
  heightResult: "O" | "X" | "-" | null;
  notes: string | null;
  isDirty?: boolean;
}

export interface FieldRow {
  phaseRegistrationId: number;
  registrationId: number;
  athleteName: string;
  institutionName: string;
  attempts: AttemptResult[];
  bestDistance: number | null;
  bestHeight: number | null;
}

export type FieldEventType =
  | "long_jump" // distancia + viento
  | "triple_jump"
  | "shot_put" // distancia
  | "javelin" // distancia
  | "discus" // distancia
  | "hammer" // distancia
  | "pole_vault" // altura
  | "high_jump"; // altura

export const FIELD_EVENT_CONFIG: Record<
  FieldEventType,
  {
    label: string;
    format: "distance" | "height";
    hasWind: boolean;
    maxAttempts: number;
  }
> = {
  long_jump: {
    label: "Salto Largo",
    format: "distance",
    hasWind: true,
    maxAttempts: 6,
  },
  triple_jump: {
    label: "Salto Triple",
    format: "distance",
    hasWind: true,
    maxAttempts: 6,
  },
  shot_put: {
    label: "Impulsión de Bala",
    format: "distance",
    hasWind: false,
    maxAttempts: 6,
  },
  javelin: {
    label: "Lanzamiento Jabalina",
    format: "distance",
    hasWind: false,
    maxAttempts: 6,
  },
  discus: {
    label: "Lanzamiento Disco",
    format: "distance",
    hasWind: false,
    maxAttempts: 6,
  },
  hammer: {
    label: "Lanzamiento Martillo",
    format: "distance",
    hasWind: false,
    maxAttempts: 6,
  },
  pole_vault: {
    label: "Salto con Garrocha",
    format: "height",
    hasWind: false,
    maxAttempts: 3,
  },
  high_jump: {
    label: "Salto Alto",
    format: "height",
    hasWind: false,
    maxAttempts: 3,
  },
};
