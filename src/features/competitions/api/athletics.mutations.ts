import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createSection,
  updateSection,
  deleteSection,
  assignSectionEntries,
  upsertSectionEntry,
} from "./athletics.api";
import { TRACK_TABLE_KEY, SECTIONS_KEY } from "./athletics.queries";
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
