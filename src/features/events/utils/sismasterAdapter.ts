import type { Event } from "../types";
import type { SismasterEvent } from "@/features/institutions/api/sismaster.queries";

/**
 * Adapta un evento de Sismaster al formato Event local
 */
export function adaptSismasterEventToLocal(
  sismasterEvent: SismasterEvent,
): Event {
  // Calcular el estado basado en las fechas
  const now = new Date();
  const startDate = new Date(sismasterEvent.startdate);
  const endDate = new Date(sismasterEvent.enddate);

  let status: "programado" | "en_curso" | "finalizado";

  if (now < startDate) {
    status = "programado";
  } else if (now >= startDate && now <= endDate) {
    status = "en_curso";
  } else {
    status = "finalizado";
  }

  return {
    eventId: sismasterEvent.idevent,
    name: sismasterEvent.name || "Sin nombre",
    startDate: sismasterEvent.startdate,
    endDate: sismasterEvent.enddate,
    location: sismasterEvent.place || "Sin ubicación",
    status,
    logoUrl: sismasterEvent.logo,
    createdAt: sismasterEvent.created_at || "",
    updatedAt: sismasterEvent.updated_at || "",
    eventCategories: [],
  };
}

export function adaptSismasterEventsToLocal(
  sismasterEvents: SismasterEvent[],
): Event[] {
  return sismasterEvents
    .filter((event) => event && event.idevent)
    .map(adaptSismasterEventToLocal);
}
