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
  lane: number | null;
  time: string | null;
  timeMs: number | null;
  mark: string | null;
}

export interface UpdateAthleticsTimeDto {
  time?: string | null;
  mark?: string | null;
  lane?: number | null;
}

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
  institutionLogo: string | null;
  isTeam: boolean;
  athleticsResultId: number | null;
  time: string | null;
  sections: SectionEntry[];
  teamMembers?: Array<{
    athleteId: number;
    name: string;
    rol: string;
  }>;
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
  heightResult: 'O' | 'X' | '-' | null;
  notes: string | null;
  isDirty?: boolean;
}

export interface FieldRow {
  phaseRegistrationId: number;
  registrationId: number;
  athleteName: string;
  institutionName: string;
  institutionLogo: string | null;
  attempts: AttemptResult[];
  bestDistance: number | null;
  bestHeight: number | null;
}

// ==================== FIELD EVENTS ====================

export type FieldEventType =
  | 'long_jump'
  | 'triple_jump'
  | 'shot_put'
  | 'javelin'
  | 'discus'
  | 'hammer'
  | 'pole_vault'
  | 'high_jump';

export const FIELD_EVENT_CONFIG: Record<
  FieldEventType,
  {
    label: string;
    format: 'distance' | 'height';
    hasWind: boolean;
    maxAttempts: number;
  }
> = {
  long_jump:   { label: 'Salto Largo',             format: 'distance', hasWind: true,  maxAttempts: 6 },
  triple_jump: { label: 'Salto Triple',             format: 'distance', hasWind: true,  maxAttempts: 6 },
  shot_put:    { label: 'Impulsión de Bala',        format: 'distance', hasWind: false, maxAttempts: 6 },
  javelin:     { label: 'Lanzamiento Jabalina',     format: 'distance', hasWind: false, maxAttempts: 6 },
  discus:      { label: 'Lanzamiento Disco',        format: 'distance', hasWind: false, maxAttempts: 6 },
  hammer:      { label: 'Lanzamiento Martillo',     format: 'distance', hasWind: false, maxAttempts: 6 },
  pole_vault:  { label: 'Salto con Garrocha',       format: 'height',   hasWind: false, maxAttempts: 3 },
  high_jump:   { label: 'Salto Alto',               format: 'height',   hasWind: false, maxAttempts: 3 },
};

// ==================== SERIES GENERATION ====================

/**
 * Tipo de formulario que mostrará GenerateAthleticsSeriesModal.
 * - 'metros'    → carreras de pista (series + carriles)
 * - 'altura'    → salto alto / garrocha (altura inicial + incremento)
 * - 'distancia' → saltos de campo y lanzamientos (intentos)
 */
export type AthleticsSeriesType = 'metros' | 'altura' | 'distancia';

/**
 * Mapa category_id → AthleticsSeriesType  (sport_id = 7, atletismo)
 *
 * Los eventos de campo se derivan de FIELD_EVENT_CONFIG para no duplicar
 * la clasificación 'height' / 'distance' que ya existe.
 *
 * Los category_id de 'altura' y 'distancia' corresponden 1-a-1 con
 * FieldEventType; las carreras son todo lo demás.
 */
export const FIELD_EVENT_CATEGORY_ID: Record<FieldEventType, number> = {
  long_jump:   220,
  triple_jump: 222,
  shot_put:    224,
  javelin:     226,
  discus:      225,
  hammer:      227,
  pole_vault:  223,
  high_jump:   221,
};

/**
 * Derivado automáticamente desde FIELD_EVENT_CONFIG + FIELD_EVENT_CATEGORY_ID.
 * No hay que mantener dos listas: si cambias FIELD_EVENT_CONFIG, esto se actualiza solo.
 */
export const ATHLETICS_SERIES_TYPE_BY_CATEGORY: Record<number, AthleticsSeriesType> =
  Object.entries(FIELD_EVENT_CATEGORY_ID).reduce<Record<number, AthleticsSeriesType>>(
    (acc, [eventType, categoryId]) => {
      const format = FIELD_EVENT_CONFIG[eventType as FieldEventType].format;
      acc[categoryId] = format === 'height' ? 'altura' : 'distancia';
      return acc;
    },
    {
      // Carreras — todo lo que no sea campo es 'metros' por defecto
      208: 'metros', // 100 METROS
      209: 'metros', // 200 METROS
      210: 'metros', // 400 METROS
      211: 'metros', // 800 METROS
      212: 'metros', // 1500 METROS
      213: 'metros', // 5000 METROS
      214: 'metros', // 10,000 METROS
      215: 'metros', // Vallas 100/110M
      216: 'metros', // Vallas 400MTS
      217: 'metros', // Vallas 3000 c/obs
      218: 'metros', // Postas 4x100
      219: 'metros', // Postas 4x400
      228: 'metros', // Heptatlon
      229: 'metros', // Marcha 10Km Varones
      230: 'metros', // Marcha 5Km Damas
      231: 'metros', // Decatlón
      232: 'metros', // Heptatlón
      233: 'metros', // Posta Mixta 4x400
      234: 'metros', // Posta Mixta 4x100
    }
  );

/** Helper para usar en el modal */
export function getAthleticsSeriesType(categoryId: number): AthleticsSeriesType {
  return ATHLETICS_SERIES_TYPE_BY_CATEGORY[categoryId] ?? 'metros';
}

// ==================== SERIES GENERATION DTOs ====================

export interface GenerateSeriesMetrosConfig {
  type: 'metros';
  seriesCount: number;
  lanesPerSeries: number;
}

export interface GenerateSeriesAlturaConfig {
  type: 'altura';
  startHeight: number;
  heightIncrement: number;
  maxAttempts: number;
}

export interface GenerateSeriesDistanciaConfig {
  type: 'distancia';
  attemptCount: number;
  qualifyingMark?: number;
}

export type GenerateSeriesConfig =
  | GenerateSeriesMetrosConfig
  | GenerateSeriesAlturaConfig
  | GenerateSeriesDistanciaConfig;

export interface GenerateAthleticsSeriesPayload {
  phaseId: number;
  categoryId: number;
  config: GenerateSeriesConfig;
}