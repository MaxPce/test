import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

// ==================== TIPOS ====================
// Misma forma que SismasterEvent — el backend de haymaster devuelve la misma estructura

export interface HaymasterEvent {
  idevent: number;
  name: string;
  periodo: number;
  place: string;
  startdate: string;
  enddate: string;
  logo?: string;
  slug?: string;
  tipo?: string;
  level?: number;
  modality?: string;
  mstatus: number;
  created_at?: string;
  updated_at?: string;
}

export interface HaymasterSport {
  idsport: number;
  namesport: string;
}

export interface HaymasterInstitution {
  idinstitution: number;
  business: string;
  businessName: string;
  abrev: string;
  avatar?: string;
  country?: string;
}

export interface HaymasterPerson {
  idperson: number;
  doctype: number;
  docnumber: string;
  firstname: string;
  lastname: string;
  surname: string;
  gender: "M" | "F" | "I" | "N";
  birthday: Date | string;
  birthday_place?: string;
  phone1: string;
  phone2?: string;
  email1: string;
  email2?: string;
  country?: string;
  address?: string;
  mstatus: number;
}

export interface HaymasterAthlete {
  idperson: number;
  firstname: string;
  lastname: string;
  surname?: string;
  docnumber: string;
  gender: "M" | "F";
  birthday: string;
  country: string;
  photo?: string;
  idinstitution: number;
  institutionName: string;
  institutionAbrev: string;
  institutionLogo?: string;
  fullName?: string;
  age?: number | null;
}

export interface HaymasterSportCategoryParam {
  idparam: number;
  code: string;
  name: string;
  idsport: number;
  athleteCount: number;
}

export interface HaymasterAthleteByCategoryDto extends HaymasterAthlete {
  idacreditation: number;
  idevent: number;
  idsport: number;
  idinstitution: number;
  division_inscrita: string;
  idparam: number;
  gender_text: string;
}

// ==================== ENDPOINTS ====================

const HAYMASTER_ENDPOINTS = {
  EVENTS: {
    LIST:   "/haymaster/events",
    DETAIL: (id: number) => `/haymaster/events/${id}`,
  },
  SPORTS: {
    LIST:   "/haymaster/sports",
    DETAIL: (id: number) => `/haymaster/sports/${id}`,
    PARAMS_BY_LOCAL_SPORT: (localSportId: number, eventId: number) =>
      `/haymaster/sports/local/${localSportId}/params/by-event/${eventId}`,
  },
  ATHLETES: {
    SEARCH:            "/haymaster/athletes/search",
    ACCREDITED:        "/haymaster/athletes/accredited",
    BY_CATEGORY_LOCAL: "/haymaster/athletes/by-category-local",
    DETAIL:            (id: number) => `/haymaster/athletes/${id}`,
    BY_DOCUMENT:       (doc: string) => `/haymaster/athletes/document/${doc}`,
    COUNT:             "/haymaster/athletes/count",
  },
  INSTITUTIONS: {
    LIST:   "/haymaster/institutions",
    DETAIL: (id: number) => `/haymaster/institutions/${id}`,
  },
};

// ==================== QUERY KEYS ====================

export const haymasterKeys = {
  all: ["haymaster"] as const,
  events: {
    all:    ["haymaster", "events"] as const,
    list:   () => [...haymasterKeys.events.all, "list"] as const,
    detail: (id: number) => [...haymasterKeys.events.all, "detail", id] as const,
  },
  sports: {
    all:    ["haymaster", "sports"] as const,
    list:   () => [...haymasterKeys.sports.all, "list"] as const,
    detail: (id: number) => [...haymasterKeys.sports.all, "detail", id] as const,
    paramsByEvent: (localSportId: number, eventId: number) =>
      [...haymasterKeys.sports.all, "params", { localSportId, eventId }] as const,
  },
  athletes: {
    all:        ["haymaster", "athletes"] as const,
    search:     (query: string) => [...haymasterKeys.athletes.all, "search", query] as const,
    detail:     (id: number)    => [...haymasterKeys.athletes.all, "detail", id] as const,
    byDocument: (dni: string)   => [...haymasterKeys.athletes.all, "document", dni] as const,
    accredited: (
      idevent?: number,
      idinstitution?: number,
      gender?: string,
      localSportId?: number,
    ) => [...haymasterKeys.athletes.all, "accredited",
          { idevent, idinstitution, gender, localSportId }] as const,
    byCategory: (
      haymasterEventId: number,
      localSportId: number,
      idparam: number,
    ) => [...haymasterKeys.athletes.all, "by-category",
          { haymasterEventId, localSportId, idparam }] as const,
    count: () => [...haymasterKeys.athletes.all, "count"] as const,
  },
  institutions: {
    all:    ["haymaster", "institutions"] as const,
    list:   () => [...haymasterKeys.institutions.all, "list"] as const,
    detail: (id: number) => [...haymasterKeys.institutions.all, "detail", id] as const,
  },
};

// ==================== HOOKS ====================

export const useHaymasterEvents = () => {
  return useQuery({
    queryKey: haymasterKeys.events.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<HaymasterEvent[]>(
        HAYMASTER_ENDPOINTS.EVENTS.LIST,
      );
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useHaymasterEvent = (id: number, enabled = true) => {
  return useQuery({
    queryKey: haymasterKeys.events.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<HaymasterEvent>(
        HAYMASTER_ENDPOINTS.EVENTS.DETAIL(id),
      );
      return data;
    },
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 10,
  });
};

export const useHaymasterSports = () => {
  return useQuery({
    queryKey: haymasterKeys.sports.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<HaymasterSport[]>(
        HAYMASTER_ENDPOINTS.SPORTS.LIST,
      );
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useHaymasterInstitutions = () => {
  return useQuery({
    queryKey: haymasterKeys.institutions.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<HaymasterInstitution[]>(
        HAYMASTER_ENDPOINTS.INSTITUTIONS.LIST,
      );
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useSearchHaymasterAthletes = (searchTerm: string, enabled = true) => {
  return useQuery({
    queryKey: haymasterKeys.athletes.search(searchTerm),
    queryFn: async () => {
      const { data } = await apiClient.get<HaymasterAthlete[]>(
        HAYMASTER_ENDPOINTS.ATHLETES.SEARCH,
        { params: { q: searchTerm, limit: 50 } },
      );
      return data;
    },
    enabled: enabled && searchTerm.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
};

interface AccreditedHaymasterAthletesOptions {
  idevent: number;
  idinstitution?: number;
  gender?: "M" | "F";
  localSportId?: number;
}

export const useAccreditedHaymasterAthletes = (
  options: AccreditedHaymasterAthletesOptions,
  enabled = true,
) => {
  const { idevent, idinstitution, gender, localSportId } = options;
  return useQuery({
    queryKey: haymasterKeys.athletes.accredited(idevent, idinstitution, gender, localSportId),
    queryFn: async () => {
      const params: Record<string, unknown> = { idevent };
      if (idinstitution) params.idinstitution = idinstitution;
      if (gender)        params.gender        = gender;
      if (localSportId)  params.localSportId  = localSportId;
      const { data } = await apiClient.get<HaymasterAthlete[]>(
        HAYMASTER_ENDPOINTS.ATHLETES.ACCREDITED,
        { params },
      );
      return data;
    },
    enabled: enabled && !!idevent,
    staleTime: 1000 * 60 * 2,
  });
};

export const useHaymasterAthlete = (id: number, enabled = true) => {
  return useQuery({
    queryKey: haymasterKeys.athletes.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<HaymasterAthlete>(
        HAYMASTER_ENDPOINTS.ATHLETES.DETAIL(id),
      );
      return data;
    },
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useHaymasterAthleteByDocument = (docNumber: string, enabled = true) => {
  return useQuery({
    queryKey: haymasterKeys.athletes.byDocument(docNumber),
    queryFn: async () => {
      const { data } = await apiClient.get<HaymasterAthlete>(
        HAYMASTER_ENDPOINTS.ATHLETES.BY_DOCUMENT(docNumber),
      );
      return data;
    },
    enabled: enabled && !!docNumber,
    staleTime: 1000 * 60 * 5,
  });
};

export const useHaymasterAthletesCount = () => {
  return useQuery({
    queryKey: haymasterKeys.athletes.count(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ count: number }>(
        HAYMASTER_ENDPOINTS.ATHLETES.COUNT,
      );
      return data.count;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useHaymasterSportCategoriesByEvent = (
  localSportId: number,
  haymasterEventId: number,
  enabled = true,
) => {
  return useQuery({
    queryKey: haymasterKeys.sports.paramsByEvent(localSportId, haymasterEventId),
    queryFn: async () => {
      const { data } = await apiClient.get<HaymasterSportCategoryParam[]>(
        HAYMASTER_ENDPOINTS.SPORTS.PARAMS_BY_LOCAL_SPORT(localSportId, haymasterEventId),
      );
      return data;
    },
    enabled: enabled && !!localSportId && !!haymasterEventId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useHaymasterAthletesByCategory = (
  haymasterEventId: number,
  localSportId: number,
  idparam: number,
  enabled = true,
) => {
  return useQuery({
    queryKey: haymasterKeys.athletes.byCategory(haymasterEventId, localSportId, idparam),
    queryFn: async () => {
      const { data } = await apiClient.get<HaymasterAthleteByCategoryDto[]>(
        HAYMASTER_ENDPOINTS.ATHLETES.BY_CATEGORY_LOCAL,
        { params: { sismasterEventId: haymasterEventId, localSportId, idparam } },
      );
      return data;
    },
    enabled: enabled && !!haymasterEventId && !!localSportId && !!idparam,
    staleTime: 1000 * 60 * 2,
  });
};