import { useOutletContext } from "react-router-dom";
import { FeaturedAthletesManager } from "../components/FeaturedAthletesManager";
import type { EventCategory } from "../types";

interface OutletContext {
  eventCategory: EventCategory;
}

export function FeaturedAthletesPage() {
  const { eventCategory } = useOutletContext<OutletContext>();

  return (
    <FeaturedAthletesManager
      eventCategoryId={eventCategory.eventCategoryId}
    />
  );
}
