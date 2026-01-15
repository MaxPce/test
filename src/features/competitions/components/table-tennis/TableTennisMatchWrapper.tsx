import { TableTennisMatchManager } from "./TableTennisMatchManager";
import type { Match } from "../../types";

interface TableTennisMatchWrapperProps {
  match: Match;
}

export function TableTennisMatchWrapper({
  match,
}: TableTennisMatchWrapperProps) {
  // Detectar si es tenis de mesa
  const sportName =
    match.phase?.eventCategory?.category?.sport?.name?.toLowerCase() || "";
  const isTableTennis =
    sportName.includes("tenis de mesa") ||
    sportName.includes("tennis de mesa") ||
    sportName.includes("ping pong");

  if (!isTableTennis) {
    return null;
  }

  // Verificar que hay equipos (no individuales)
  const hasTeams = match.participations?.some(
    (p) => p.registration?.team !== null
  );

  if (!hasTeams) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Este sistema es solo para partidos por equipos</p>
      </div>
    );
  }

  return <TableTennisMatchManager match={match} />;
}
