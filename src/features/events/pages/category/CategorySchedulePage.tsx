import { useOutletContext } from "react-router-dom";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSportDetection } from "./hooks/useSportDetection";
import { useCategorySchedule } from "./hooks/useCategorySchedule";
import { ClimbingScheduleView } from "./components/schedule/sports/ClimbingScheduleView";
import { AthleticsScheduleView } from "./components/schedule/sports/AthleticsScheduleView";
import { CombinedScheduleView } from "./components/schedule/sports/CombinedScheduleView";
import { WeightliftingScheduleView } from "./components/schedule/sports/WeightliftingScheduleView";
import { TimedSportScheduleView } from "./components/schedule/sports/TimedSportScheduleView";
import { ChessScheduleView } from "./components/schedule/sports/ChessScheduleView";
import { GenericScheduleView } from "./components/schedule/sports/GenericScheduleView";
import type { EventCategory } from "../../types";

export function CategorySchedulePage() {
  const { eventCategory } = useOutletContext<{ eventCategory: EventCategory }>();

  const sport = useSportDetection(eventCategory);
  const schedule = useCategorySchedule(eventCategory);

  // Esperar carga inicial de fases antes de decidir qué vista renderizar
  if (schedule.phasesLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // ── Router de deportes ────────────────────────────────────────────────────
  // El orden importa: los casos más específicos van primero.

  if (sport.isCombined) {
    const combinedType = sport.getCombinedType()!;
    return (
      <CombinedScheduleView
        eventCategory={eventCategory}
        schedule={schedule}
        combinedType={combinedType}
      />
    );
  }

  if (sport.isAtletismo) {
    return (
      <AthleticsScheduleView
        eventCategory={eventCategory}
        schedule={schedule}
      />
    );
  }

  if (sport.isClimbing) {
    return (
      <ClimbingScheduleView
        eventCategory={eventCategory}
        schedule={schedule}
      />
    );
  }

  if (sport.isWeightlifting) {
    return (
      <WeightliftingScheduleView
        eventCategory={eventCategory}
        schedule={schedule}
      />
    );
  }

  if (sport.isTimedSport) {
    return (
      <TimedSportScheduleView
        eventCategory={eventCategory}
        schedule={schedule}
      />
    );
  }

  if (sport.isChess) {
    return (
      <ChessScheduleView
        eventCategory={eventCategory}
        schedule={schedule}
      />
    );
  }

  // Fallback: judo, karate, wushu, taekwondo, fútbol, tiro deportivo,
  // tenis de mesa, wrestling, y cualquier deporte nuevo que agregues.
  return (
    <GenericScheduleView
      eventCategory={eventCategory}
      schedule={schedule}
      sport={sport}
    />
  );
}