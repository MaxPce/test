import { useOutletContext } from "react-router-dom";
import { SwimmingResultsTable } from "../components/SwimmingResultsTable";
import type { EventCategory } from "@/features/events/types";

export function SwimmingResultsPage() {
  const { eventCategory } = useOutletContext<{
    eventCategory: EventCategory;
  }>();

  if (!eventCategory) {
    return <p className="text-sm text-red-400">Categoría no encontrada</p>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h3 className="text-xl font-semibold text-gray-900">
          Registrar Tiempos
        </h3>
        <p className="text-gray-600 mt-1">
          {eventCategory.registrations?.length || 0} participante
          {eventCategory.registrations?.length !== 1 ? "s" : ""} inscrito
          {eventCategory.registrations?.length !== 1 ? "s" : ""}
        </p>
      </header>

      <SwimmingResultsTable
        eventCategoryId={eventCategory.eventCategoryId}
        registrations={eventCategory.registrations || []}
        categoryName={eventCategory.category?.name}
      />
    </div>
  );
}
