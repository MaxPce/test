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
