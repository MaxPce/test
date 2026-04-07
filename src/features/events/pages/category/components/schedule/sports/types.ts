import type { EventCategory } from "@/features/events/types";
import type { useCategorySchedule } from "../../../hooks/useCategorySchedule";
import type { useSportDetection } from "../../../hooks/useSportDetection";

export type ScheduleHook = ReturnType<typeof useCategorySchedule>;
export type SportDetection = ReturnType<typeof useSportDetection>;

export interface SportViewProps {
  eventCategory: EventCategory;
  schedule: ScheduleHook;
}

export interface GenericViewProps extends SportViewProps {
  sport: SportDetection;
}