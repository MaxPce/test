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

  // Solo bloquear si genuinamente no hay participantes
  if (participations.length < 2) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="mb-2">Este match aún no tiene participantes asignados.</p>
        <p className="text-sm">Asigna primero los participantes.</p>
      </div>
    );
  }

  // ✅ No validar members aquí — TableTennisMatchManager
  // fetches sus propios lineups y maneja todos los estados internamente
  return (
    <TableTennisMatchManager
      match={enrichedMatch}
      phase={phase ?? match.phase}
    />
  );
}
