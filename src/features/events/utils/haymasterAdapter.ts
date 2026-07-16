// src/features/events/utils/haymasterAdapter.ts  (nuevo, es idéntico)
import type { Event } from "../types";
import type { HaymasterEvent } from "@/features/institutions/api/haymaster.queries";

export function adaptHaymasterEventToLocal(haymasterEvent: HaymasterEvent): Event {
  const now = new Date();
  const startDate = new Date(haymasterEvent.startdate);
  const endDate   = new Date(haymasterEvent.enddate);

  let status: "programado" | "en_curso" | "finalizado";
  if      (now < startDate)                    status = "programado";
  else if (now >= startDate && now <= endDate) status = "en_curso";
  else                                          status = "finalizado";

  return {
    eventId:    haymasterEvent.idevent,
    name:       haymasterEvent.name || "Sin nombre",
    startDate:  haymasterEvent.startdate,
    endDate:    haymasterEvent.enddate,
    location:   haymasterEvent.place || "Sin ubicación",
    status,
    logoUrl:    haymasterEvent.logo,
    createdAt:  haymasterEvent.created_at || "",
    updatedAt:  haymasterEvent.updated_at || "",
    eventCategories: [],
    source: 'haymaster',  // ← clave
  };
}

export function adaptHaymasterEventsToLocal(events: HaymasterEvent[]): Event[] {
  return events.filter((e) => e && e.idevent).map(adaptHaymasterEventToLocal);
}