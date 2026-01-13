export type UserRole = "admin" | "moderator" | "viewer";

export type EventStatus = "programado" | "en_curso" | "finalizado";

export type MatchStatus =
  | "programado"
  | "en_curso"
  | "finalizado"
  | "cancelado";

export type Gender = "M" | "F" | "MIXTO";

export type FormatType = "eliminacion_directa" | "round_robin" | "suizo";

export type ResultType =
  | "combat"
  | "time"
  | "score"
  | "weight"
  | "distance"
  | "height";

export type CategoryType = "individual" | "equipo";

export type TeamRole = "capitan" | "titular" | "suplente";

export type PhaseType = "grupo" | "eliminacion" | "repechaje";

export type Corner = "blue" | "white" | "A" | "B";
