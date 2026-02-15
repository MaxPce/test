import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

// ==================== TIPOS ====================

export interface SismasterEvent {
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

export interface SismasterSport {
  idsport: number;
  namesport: string;
}

export interface SismasterInstitution {
  idinstitution: number;
  business: string;
  businessName: string;
  abrev: string;
  avatar?: string;
  country?: string;
}

// Para búsquedas simples (sin joins)
export interface SismasterPerson {
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

// Para atletas acreditados (con joins completos)
export interface SismasterAthlete {
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

// ==================== ENDPOINTS ====================

const SISMASTER_ENDPOINTS = {
  EVENTS: {
    LIST: "/sismaster/events",
    DETAIL: (id: number) => `/sismaster/events/${id}`,
  },
  SPORTS: {
    LIST: "/sismaster/sports",
    DETAIL: (id: number) => `/sismaster/sports/${id}`,
  },
  ATHLETES: {
    SEARCH: "/sismaster/athletes/search",
    ACCREDITED: "/sismaster/athletes/accredited",
    DETAIL: (id: number) => `/sismaster/athletes/${id}`,
    BY_DOCUMENT: (doc: string) => `/sismaster/athletes/document/${doc}`,
    COUNT: "/sismaster/athletes/count",
  },
  INSTITUTIONS: {
    LIST: "/sismaster/institutions",
    DETAIL: (id: number) => `/sismaster/institutions/${id}`,
  },
};

// ==================== QUERY KEYS ====================

export const sismasterKeys = {
  all: ["sismaster"] as const,
  events: {
    all: ["sismaster", "events"] as const,
    list: () => [...sismasterKeys.events.all, "list"] as const,
    detail: (id: number) =>
      [...sismasterKeys.events.all, "detail", id] as const,
  },
  sports: {
    all: ["sismaster", "sports"] as const,
    list: () => [...sismasterKeys.sports.all, "list"] as const,
    detail: (id: number) =>
      [...sismasterKeys.sports.all, "detail", id] as const,
  },
  athletes: {
    all: ["sismaster", "athletes"] as const,
    search: (query: string) =>
      [...sismasterKeys.athletes.all, "search", query] as const,
    detail: (id: number) =>
      [...sismasterKeys.athletes.all, "detail", id] as const,
    byDocument: (dni: string) =>
      [...sismasterKeys.athletes.all, "document", dni] as const,
    accredited: (idevent?: number, idinstitution?: number, gender?: string) =>
      [
        ...sismasterKeys.athletes.all,
        "accredited",
        { idevent, idinstitution, gender },
      ] as const,
    count: () => [...sismasterKeys.athletes.all, "count"] as const,
  },
  institutions: {
    all: ["sismaster", "institutions"] as const,
    list: () => [...sismasterKeys.institutions.all, "list"] as const,
    detail: (id: number) =>
      [...sismasterKeys.institutions.all, "detail", id] as const,
  },
};

// ==================== HOOKS ====================

/**
 * Listar eventos de Sismaster
 */
export const useSismasterEvents = () => {
  return useQuery({
    queryKey: sismasterKeys.events.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<SismasterEvent[]>(
        SISMASTER_ENDPOINTS.EVENTS.LIST,
      );
      return data;
    },
    staleTime: 1000 * 60 * 10, // Cache 10 minutos
  });
};

/**
 * Obtener un evento específico
 */
export const useSismasterEvent = (id: number, enabled = true) => {
  return useQuery({
    queryKey: sismasterKeys.events.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<SismasterEvent>(
        SISMASTER_ENDPOINTS.EVENTS.DETAIL(id),
      );
      return data;
    },
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 10,
  });
};

/**
 * Listar deportes de Sismaster
 */
export const useSismasterSports = () => {
  return useQuery({
    queryKey: sismasterKeys.sports.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<SismasterSport[]>(
        SISMASTER_ENDPOINTS.SPORTS.LIST,
      );
      return data;
    },
    staleTime: 1000 * 60 * 10, // Cache 10 minutos
  });
};

/**
 * Listar instituciones de Sismaster
 */
export const useSismasterInstitutions = () => {
  return useQuery({
    queryKey: sismasterKeys.institutions.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<SismasterInstitution[]>(
        SISMASTER_ENDPOINTS.INSTITUTIONS.LIST,
      );
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache 5 minutos
  });
};

/**
 * Buscar atletas por nombre o documento
 */
export const useSearchAthletes = (searchTerm: string, enabled = true) => {
  return useQuery({
    queryKey: sismasterKeys.athletes.search(searchTerm),
    queryFn: async () => {
      const { data } = await apiClient.get<SismasterAthlete[]>(
        SISMASTER_ENDPOINTS.ATHLETES.SEARCH,
        {
          params: { q: searchTerm, limit: 50 },
        },
      );
      return data;
    },
    enabled: enabled && searchTerm.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
};

interface AccreditedAthletesOptions {
  idevent: number;
  idinstitution?: number;
  gender?: "M" | "F";
}

export const useAccreditedAthletes = (
  options: AccreditedAthletesOptions,
  enabled = true,
) => {
  const { idevent, idinstitution, gender } = options;

  return useQuery({
    queryKey: sismasterKeys.athletes.accredited(idevent, idinstitution, gender),
    queryFn: async () => {
      const params: Record<string, any> = { idevent };
      if (idinstitution) params.idinstitution = idinstitution;
      if (gender) params.gender = gender;

      const { data } = await apiClient.get<SismasterAthlete[]>(
        SISMASTER_ENDPOINTS.ATHLETES.ACCREDITED,
        { params },
      );
      return data;
    },
    enabled: enabled && !!idevent,
    staleTime: 1000 * 60 * 2, // Cache 2 minutos
  });
};

/**
 * Obtener un atleta por ID
 */
export const useSismasterAthlete = (id: number, enabled = true) => {
  return useQuery({
    queryKey: sismasterKeys.athletes.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<SismasterAthlete>(
        SISMASTER_ENDPOINTS.ATHLETES.DETAIL(id),
      );
      return data;
    },
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Obtener un atleta por documento
 */
export const useSismasterAthleteByDocument = (
  docNumber: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: sismasterKeys.athletes.byDocument(docNumber),
    queryFn: async () => {
      const { data } = await apiClient.get<SismasterAthlete>(
        SISMASTER_ENDPOINTS.ATHLETES.BY_DOCUMENT(docNumber),
      );
      return data;
    },
    enabled: enabled && !!docNumber,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Obtener contador total de atletas en Sismaster
 */
export const useAthletesCount = () => {
  return useQuery({
    queryKey: sismasterKeys.athletes.count(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ count: number }>(
        SISMASTER_ENDPOINTS.ATHLETES.COUNT,
      );
      return data.count;
    },
    staleTime: 1000 * 60 * 10, // Cache 10 minutos
  });
};
