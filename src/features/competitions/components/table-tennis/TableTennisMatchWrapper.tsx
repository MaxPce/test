import { TableTennisMatchManager } from "./TableTennisMatchManager";
import type { Match } from "../../types";
import type { EventCategory } from "@/features/events/types";

interface TableTennisMatchWrapperProps {
  match: Match;
  eventCategory: EventCategory;
  onClose?: () => void;
}

export function TableTennisMatchWrapper({
  match,
  eventCategory,
}: TableTennisMatchWrapperProps) {
  const sportName = eventCategory.category?.sport?.name?.toLowerCase() || "";
  const isTableTennis =
    sportName.includes("tenis de mesa") ||
    sportName.includes("tennis de mesa") ||
    sportName.includes("ping pong");

  if (!isTableTennis) {
    return null;
  }

  const categoryType = eventCategory.category?.type?.toLowerCase() || "";

  const enrichedMatch: Match = {
    ...match,
    phase: {
      ...match.phase,
      phaseId: match.phaseId,
      eventCategoryId: eventCategory.eventCategoryId,
      name: match.phase?.name || "",
      type: match.phase?.type || "eliminacion",
      eventCategory: {
        eventCategoryId: eventCategory.eventCategoryId,
        categoryId: eventCategory.categoryId,
        category: eventCategory.category,
      },
    } as any,
  };

  // Verificar que hay participantes
  const hasParticipations =
    match.participations && match.participations.length >= 2;

  if (!hasParticipations) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="mb-2">Este match aún no tiene participantes asignados.</p>
        <p className="text-sm">Asigna primero los participantes.</p>
      </div>
    );
  }

  // según tipo de categoría
  if (categoryType === "individual") {
    // Para individual, verificar que ambos tienen registration.athlete
    const individualsWithAthlete = match.participations.filter(
      (p) => p.registration?.athlete != null,
    );

    if (individualsWithAthlete.length < 2) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2 font-semibold">
            Los participantes no están registrados correctamente.
          </p>
          <p className="text-sm">
            Para modalidad individual, cada participante debe ser un atleta
            registrado.
          </p>
        </div>
      );
    }
  } else if (categoryType === "equipo" || categoryType === "equipos") {
    // Para equipos, verificar que tienen al menos 2 miembros
    const teamsWithMembers = match.participations.filter(
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

  return <TableTennisMatchManager match={enrichedMatch} />;
}
