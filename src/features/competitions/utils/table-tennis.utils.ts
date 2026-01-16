import type { Match } from "../types/index";

export type TableTennisModality = "individual" | "doubles" | "team";

/**
 * Verificar si el match es de Tenis de Mesa
 */
export function isTableTennisMatch(match: Match): boolean {
  const sportName =
    match.phase?.eventCategory?.category?.sport?.name?.toLowerCase() || "";
  if (
    sportName.includes("tenis de mesa") ||
    sportName.includes("tennis de mesa") ||
    sportName.includes("ping pong")
  ) {
    return true;
  }

  const categoryName =
    match.phase?.eventCategory?.category?.name?.toLowerCase() || "";
  if (
    categoryName.includes("tenis de mesa") ||
    categoryName.includes("tennis de mesa") ||
    categoryName.includes("ping pong")
  ) {
    return true;
  }

  return false;
}

/**
 * Detectar modalidad de tenis de mesa desde el match
 * ✅ NUEVA LÓGICA: Se detecta por CANTIDAD de miembros del equipo
 */
export function detectTableTennisModality(match: Match): TableTennisModality {
  const categoryType =
    match.phase?.eventCategory?.category?.type?.toLowerCase() || "";

  // Si es individual en la BD, es individual
  if (categoryType === "individual") {
    return "individual";
  }

  // Si es equipo, detectar por cantidad de miembros
  if (categoryType === "equipo" || categoryType === "equipos") {
    // Verificar participations
    if (match.participations && match.participations.length > 0) {
      const firstParticipation = match.participations[0];

      // Si tiene athlete directo (por si acaso), es individual
      if (firstParticipation.registration?.athlete) {
        return "individual";
      }

      // Si tiene team, verificar tamaño
      const teamSize =
        firstParticipation.registration?.team?.members?.length || 0;

      if (teamSize === 2) {
        return "doubles"; // ✅ Dobles: equipo de 2
      }

      if (teamSize >= 3) {
        return "team"; // ✅ Equipos: 3 o más
      }
    }
  }

  // Default: team
  return "team";
}

/**
 * Obtener label de modalidad
 */
export function getModalityLabel(
  modality: TableTennisModality,
  gender?: string
): string {
  const genderLabel =
    gender === "M"
      ? "Masculino"
      : gender === "F"
      ? "Femenino"
      : gender === "MIXTO"
      ? "Mixto"
      : "";

  switch (modality) {
    case "individual":
      return `Individual ${genderLabel}`.trim();
    case "doubles":
      return `Dobles ${genderLabel}`.trim();
    case "team":
      return `Equipos ${genderLabel}`.trim();
    default:
      return "Tenis de Mesa";
  }
}

/**
 * Validar si necesita lineup
 * ✅ Solo equipos de 3+ miembros necesitan lineup
 */
export function needsLineup(modality: TableTennisModality): boolean {
  return modality === "team"; // Solo equipos de 3+
}
