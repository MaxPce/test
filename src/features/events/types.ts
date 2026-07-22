import type { EventStatus } from "@/lib/types/common.types";
import type { Category } from "@/features/sports/types";
import type { Athlete, Team } from "@/features/institutions/types";
import type { Company } from "@/features/companies/types";

export interface Event {
  eventId: number;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  status: EventStatus;
  logoUrl?: string;
  companyId?: number;
  company?: Company;
  createdAt: string;
  updatedAt: string;
  eventCategories?: EventCategory[];
  source?: 'sismaster' | 'haymaster';
}

export interface CreateEventData {
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  status: EventStatus;
  logoUrl?: string;
  companyId?: number;
}

export interface UpdateEventData {
  name?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  status?: EventStatus;
  logoUrl?: string;
  companyId?: number;
}

export interface EventCategory {
  eventCategoryId: number;
  eventId: number;
  categoryId: number;
  externalEventId?: number;
  externalSportId?: number;
  haymasterEventId?: number;    // ← AGREGAR esta línea
  externalSportParamId?: number; // ← también existe en el entity, opcional agregarlo
  status: "pendiente" | "en_curso" | "finalizado";
  createdAt: string;
  updatedAt: string;
  category?: Category;
  event?: Event;
  registrations?: Registration[];
}

export interface CreateEventCategoryData {
  eventId: number;
  categoryId: number;
  externalEventId?: number;
  externalSportId?: number;
  status?: "pendiente" | "en_curso" | "finalizado";
}

export interface UpdateEventCategoryData {
  externalEventId?: number;
  externalSportId?: number;
  haymasterEventId?: number;       // ← AGREGAR esto
  status?: "pendiente" | "en_curso" | "finalizado";
}


export interface Registration {
  registrationId: number;
  eventCategoryId: number;
  athleteId?: number;
  external_athlete_id?: number;
  external_institution_id?: number;
  teamId?: number;
  seedNumber?: number;
  weightClass?: string | null;
  createdAt: string;
  updatedAt: string;
  athlete?: Athlete;
  team?: Team;
  eventCategory?: EventCategory;
}

export interface CreateRegistrationData {
  eventCategoryId: number;
  athleteId?: number;
  external_athlete_id?: number;
  teamId?: number;
  seedNumber?: number;
}

export interface BulkRegistrationData {
  eventCategoryId: number;
  athleteIds?: number[];
  external_athlete_ids?: number[];
}

export interface FeaturedAthlete {
  featuredAthleteId: number;
  eventCategoryId: number;
  registrationId: number;
  reason: string;
  phaseId: number | null;
  createdAt: string;
  updatedAt: string;
  registration?: {
    registrationId: number;
    athleteId?: number;
    teamId?: number;
    athlete?: Athlete;
    team?: Team;
  };
}

export interface CreateFeaturedAthleteData {
  eventCategoryId: number;
  registrationId: number;
  reason: string;
}

export interface UpdateFeaturedAthleteData {
  reason?: string;
}

export interface UpsertFeaturedAthleteByPhasePayload {
  phaseId:         number;
  eventCategoryId: number;
  registrationId:  number;
  reason?:         string;
}

export interface CreateLocalAthleteRegistrationData {
  eventCategoryId: number;
  name: string;             // nombre completo
  docNumber?: string;
  gender?: 'MASCULINO' | 'FEMENINO' | 'MIXTO';
  dateBirth?: string;       // formato ISO: "1990-05-20"
  nationality?: string;     // 3 letras: "PER", "COL", etc.
  photoUrl?: string;
  institutionId?: number;
  seedNumber?: number;
}