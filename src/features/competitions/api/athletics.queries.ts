import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAthleticsFieldTable,
  getAthleticsTrackTable,
  getClassificationStatus,
  getSectionsByPhase,
  getAthleticsClassification, 
  overrideRank
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

  export const CLASSIFICATION_STATUS_KEY = (phaseId: number) =>
  ["athletics-classification-status", phaseId] as const;

export const useClassificationStatus = (phaseId: number) =>
  useQuery({
    queryKey: CLASSIFICATION_STATUS_KEY(phaseId),
    queryFn: () => getClassificationStatus(phaseId),
    enabled: !!phaseId,
    staleTime: 0, // siempre fresco al montar
  });
export const useAthleticsClassification = (phaseId: number) =>
  useQuery({
    queryKey: ["athletics-classification", phaseId] as const,
    queryFn: () => getAthleticsClassification(phaseId),
    enabled: !!phaseId,
  });

export const useOverrideRank = (phaseId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      phaseRegistrationId,
      rankPosition,
    }: {
      phaseRegistrationId: number;
      rankPosition: number;
    }) => overrideRank(phaseRegistrationId, rankPosition),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["athletics-classification", phaseId] });
    },
  });
};
