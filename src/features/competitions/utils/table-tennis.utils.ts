import type { Match } from "../types/index";

export type TableTennisModality = "individual" | "doubles" | "team";

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

export function detectTableTennisModality(match: Match): TableTennisModality {
  if (match.participations && match.participations.length > 0) {
    const firstParticipation = match.participations[0];

    if (firstParticipation.registration?.athlete) {
      return "individual";
    }

    const members = firstParticipation.registration?.team?.members;
    if (members != null) {
      if (members.length === 2) return "doubles";
      if (members.length >= 3) return "team";
    }

    if (firstParticipation.registration?.team) {
      const categoryName =
        match.phase?.eventCategory?.category?.name?.toLowerCase() || "";
      if (categoryName.includes("doble")) return "doubles";
      return "team";
    }
  }

  const categoryType =
    match.phase?.eventCategory?.category?.type?.toLowerCase() || "";

  if (categoryType === "individual") return "individual";
  if (categoryType === "equipo" || categoryType === "equipos") return "team";

  const categoryName =
    match.phase?.eventCategory?.category?.name?.toLowerCase() || "";
  if (categoryName.includes("individual")) return "individual";
  if (categoryName.includes("doble")) return "doubles";
  if (categoryName.includes("equipo")) return "team";

  return "individual";
}

export function getModalityLabel(
  modality: TableTennisModality,
  gender?: string,
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

export function needsLineup(modality: TableTennisModality): boolean {
  return modality === "team";
}
