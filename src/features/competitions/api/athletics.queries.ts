import { useQuery } from "@tanstack/react-query";
import {
  getAthleticsFieldTable,
  getAthleticsTrackTable,
  getSectionsByPhase,
} from "./athletics.api";

export const TRACK_TABLE_KEY = (phaseId: number) =>
  ["athletics-track-table", phaseId] as const;

export const SECTIONS_KEY = (phaseId: number) =>
  ["athletics-sections", phaseId] as const;

export const useAthleticsTrackTable = (phaseId: number) =>
  useQuery({
    queryKey: TRACK_TABLE_KEY(phaseId),
    queryFn: () => getAthleticsTrackTable(phaseId),
    enabled: !!phaseId,
  });

export const useAthleticsSections = (phaseId: number) =>
  useQuery({
    queryKey: SECTIONS_KEY(phaseId),
    queryFn: () => getSectionsByPhase(phaseId),
    enabled: !!phaseId,
  });

export const FIELD_TABLE_KEY = (phaseId: number) =>
  ["athletics-field-table", phaseId] as const;

export const useAthleticsFieldTable = (phaseId: number) =>
  useQuery({
    queryKey: FIELD_TABLE_KEY(phaseId),
    queryFn: () => getAthleticsFieldTable(phaseId),
    enabled: !!phaseId,
  });
