// src/features/athletics/api/athletics.mutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createSection,
  updateSection,
  deleteSection,
  assignSectionEntries,
  upsertSectionEntry,
  moveEntryToSection,
  classifyPhase,
  reopenPhase
} from "./athletics.api";
import { TRACK_TABLE_KEY, SECTIONS_KEY, CLASSIFICATION_STATUS_KEY } from "./athletics.queries";
import type {
  AssignSectionEntriesDto,
  UpsertSectionEntryDto,
  CreateSectionDto,
  UpdateSectionDto,
} from "../types/athletics.types";


export const useCreateSection = (phaseId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSectionDto) => createSection(dto),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SECTIONS_KEY(phaseId) }),
    onError: () => toast.error("Error al crear sección"),
  });
};


export const useUpdateSection = (phaseId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateSectionDto }) =>
      updateSection(id, dto),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SECTIONS_KEY(phaseId) }),
    onError: () => toast.error("Error al actualizar sección"),
  });
};


export const useDeleteSection = (phaseId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SECTIONS_KEY(phaseId) });
      queryClient.invalidateQueries({ queryKey: TRACK_TABLE_KEY(phaseId) });
    },
    onError: () => toast.error("Error al eliminar sección"),
  });
};


export const useAssignSectionEntries = (phaseId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: AssignSectionEntriesDto) => assignSectionEntries(dto),
    onSuccess: () =>
      queryClient.refetchQueries({ queryKey: TRACK_TABLE_KEY(phaseId) }),
    onError: () => toast.error("Error al asignar atletas"),
  });
};


export const useUpsertSectionEntry = (phaseId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpsertSectionEntryDto) => upsertSectionEntry(dto),
    onSuccess: () =>
      queryClient.refetchQueries({ queryKey: TRACK_TABLE_KEY(phaseId) }),
    onError: () => toast.error("Error al guardar"),
  });
};


export const useMoveEntryToSection = (phaseId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      entryId,
      athleticsSectionId,
    }: {
      entryId: number;
      athleticsSectionId: number;
    }) => moveEntryToSection(entryId, { athleticsSectionId }),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: TRACK_TABLE_KEY(phaseId) });
      toast.success("Atleta movido de serie");
    },
    onError: (error: any) => {
      queryClient.refetchQueries({ queryKey: TRACK_TABLE_KEY(phaseId) });
      const status = error?.response?.status;
      toast.error(
        status === 403
          ? "Sin permisos para mover atletas"
          : status === 404
            ? "Atleta o sección no encontrada"
            : "Error al mover el atleta",
      );
    },
  });
};


// ── Clasificación de fase ─────────────────────────────────────────────────────

export type ClassifyPhaseResult = {
  phaseRegistrationId: number;
  rankPosition: number | null;
  pointsAwarded: number;
  isScoringEligible: boolean;
  exclusionReason: string | null;
  finalTime: string | null;
  finalDistance: number | null;
  finalHeight: number | null;
  finalIaafPoints: number | null;
  resultSource: string;
};

export const useClassifyPhase = (phaseId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (): Promise<ClassifyPhaseResult[]> => classifyPhase(phaseId),
    onSuccess: (data) => {
      const eligible = data.filter((r) => r.isScoringEligible && r.rankPosition);
      toast.success(
        `Fase finalizada — ${eligible.length} atleta${eligible.length !== 1 ? "s" : ""} clasificado${eligible.length !== 1 ? "s" : ""}`,
      );
      // Invalida score-tables para que el componente de puntajes se refresque
      queryClient.invalidateQueries({ queryKey: ["score-tables"] });
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      toast.error(
        status === 404
          ? "Fase no encontrada"
          : status === 400
            ? "Datos insuficientes para clasificar"
            : "Error al finalizar la fase",
      );
    },
  });
};

export const useReopenPhase = (phaseId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => reopenPhase(phaseId),
    onSuccess: () => {
      // Invalida el status Y las clasificaciones
      queryClient.invalidateQueries({
        queryKey: CLASSIFICATION_STATUS_KEY(phaseId),
      });
      queryClient.invalidateQueries({ queryKey: ["score-tables"] });
    },
    onError: () => toast.error("Error al reabrir la fase"),
  });
};
