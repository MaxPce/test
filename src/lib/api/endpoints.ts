export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
  },

  // Sports
  SPORTS: {
    TYPES: "/sports/types",
    TYPE_DETAIL: (id: number) => `/sports/types/${id}`,
    LIST: "/sports",
    CREATE: "/sports",
    DETAIL: (id: number) => `/sports/${id}`,
    UPDATE: (id: number) => `/sports/${id}`,
    DELETE: (id: number) => `/sports/${id}`,
  },

  // Categories
  CATEGORIES: {
    LIST: "/sports/categories",
    CREATE: "/sports/categories",
    DETAIL: (id: number) => `/sports/categories/${id}`,
    UPDATE: (id: number) => `/sports/categories/${id}`,
    DELETE: (id: number) => `/sports/categories/${id}`,
  },

  // Institutions
  INSTITUTIONS: {
    LIST: "/institutions",
    CREATE: "/institutions",
    DETAIL: (id: number) => `/institutions/${id}`,
    UPDATE: (id: number) => `/institutions/${id}`,
    DELETE: (id: number) => `/institutions/${id}`,
  },

  // Athletes
  ATHLETES: {
    LIST: "/institutions/athletes",
    CREATE: "/institutions/athletes",
    DETAIL: (id: number) => `/institutions/athletes/${id}`,
    UPDATE: (id: number) => `/institutions/athletes/${id}`,
    DELETE: (id: number) => `/institutions/athletes/${id}`,
  },

  // Teams
  TEAMS: {
    LIST: "/institutions/teams",
    CREATE: "/institutions/teams",
    DETAIL: (id: number) => `/institutions/teams/${id}`,
    UPDATE: (id: number) => `/institutions/teams/${id}`,
    DELETE: (id: number) => `/institutions/teams/${id}`,
    ADD_MEMBER: (teamId: number) => `/institutions/teams/${teamId}/members`,
    REMOVE_MEMBER: (teamId: number, athleteId: number) =>
      `/institutions/teams/${teamId}/members/${athleteId}`,
  },

  // Events
  EVENTS: {
    LIST: "/events",
    CREATE: "/events",
    DETAIL: (id: number) => `/events/${id}`,
    UPDATE: (id: number) => `/events/${id}`,
    DELETE: (id: number) => `/events/${id}`,
  },

  // Event Categories
  EVENT_CATEGORIES: {
    LIST: "/events/categories",
    CREATE: "/events/categories",
    DETAIL: (id: number) => `/events/categories/${id}`,
    UPDATE: (id: number) => `/events/categories/${id}`,
    DELETE: (id: number) => `/events/categories/${id}`,
  },

  // Registrations
  REGISTRATIONS: {
    LIST: "/events/registrations",
    CREATE: "/events/registrations",
    BULK: "/events/registrations/bulk",
    DETAIL: (id: number) => `/events/registrations/${id}`,
    DELETE: (id: number) => `/events/registrations/${id}`,
  },

  // Competitions
  PHASES: {
    LIST: "/competitions/phases",
    CREATE: "/competitions/phases",
    DETAIL: (id: number) => `/competitions/phases/${id}`,
    UPDATE: (id: number) => `/competitions/phases/${id}`,
    DELETE: (id: number) => `/competitions/phases/${id}`,
    STANDINGS: (phaseId: number) => `/competitions/phases/${phaseId}/standings`,
  },

  MATCHES: {
    LIST: "/competitions/matches",
    CREATE: "/competitions/matches",
    DETAIL: (id: number) => `/competitions/matches/${id}`,
    UPDATE: (id: number) => `/competitions/matches/${id}`,
    DELETE: (id: number) => `/competitions/matches/${id}`,
  },

  BRACKETS: {
    GENERATE: "/competitions/brackets/generate",
    ROUND_ROBIN: "/competitions/round-robin/initialize",
  },

  // Results
  RESULTS: {
    LIST: "/results",
    CREATE: "/results",
    PUBLISH: "/results/publish",
    LIVE_SCORE: "/results/live-score",
    MATCH_RESULTS: (matchId: number) => `/results/matches/${matchId}`,
    UPDATE: (id: number) => `/results/${id}`,
    DELETE: (id: number) => `/results/${id}`,
  },
} as const;
