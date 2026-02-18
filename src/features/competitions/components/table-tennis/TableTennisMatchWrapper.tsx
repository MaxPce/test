import { TableTennisMatchManager } from "./TableTennisMatchManager";
import type { Match } from "../../types";
import type { EventCategory } from "@/features/events/types";

interface TableTennisMatchWrapperProps {
  match: Match;
  eventCategory?: EventCategory | any;
  phase?: any;
  onClose?: () => void;
}

export function TableTennisMatchWrapper({
  match,
  eventCategory,
  phase,
}: TableTennisMatchWrapperProps) {
  const sportName =
    eventCategory?.category?.sport?.name?.toLowerCase() ||
    match.phase?.eventCategory?.category?.sport?.name?.toLowerCase() ||
    "";

  const isTableTennis =
    sportName.includes("tenis de mesa") ||
    sportName.includes("tennis de mesa") ||
    sportName.includes("ping pong") ||
    sportName === "";

  if (!isTableTennis) {
    return null;
  }

  const resolvedEventCategory = eventCategory ?? match.phase?.eventCategory;
  const categoryType =
    resolvedEventCategory?.category?.type?.toLowerCase() || "";

  const enrichedMatch: Match = {
    ...match,
    phase: {
      ...match.phase,
      phaseId: match.phase?.phaseId ?? (match as any).phaseId,
      eventCategoryId:
        resolvedEventCategory?.eventCategoryId ??
        match.phase?.eventCategoryId ??
        0,
      name: match.phase?.name || "",
      type: match.phase?.type || "eliminacion",
      eventCategory: resolvedEventCategory ?? match.phase?.eventCategory,
    } as any,
  };

  const participations: any[] = match.participations ?? [];

  if (participations.length < 2) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="mb-2">Este match aún no tiene participantes asignados.</p>
        <p className="text-sm">Asigna primero los participantes.</p>
      </div>
    );
  }

  if (categoryType === "equipo" || categoryType === "equipos") {
    const teamsWithMembers = participations.filter(
      (p) =>
        p.registration?.team?.members &&
        p.registration.team.members.length >= 2,
    );

    if (teamsWithMembers.length < 2) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2 font-semibold">
            Los equipos no tienen miembros registrados.
          </p>
          <p className="text-sm">Cada equipo debe tener al menos 2 atletas.</p>
          <p className="text-sm mt-2">
            • <strong>Dobles:</strong> 2 jugadores (juegan ambos directamente)
          </p>
          <p className="text-sm">
            • <strong>Equipos:</strong> 4 jugadores (3 titulares + 1 suplente)
          </p>
          <p className="text-sm mt-3 text-orange-600">
            Ve a <strong>Instituciones → Equipos</strong> y agrega los miembros
            del equipo.
          </p>
        </div>
      );
    }
  }

  return (
    <TableTennisMatchManager
      match={enrichedMatch}
      phase={phase ?? match.phase}
    />
  );
}
