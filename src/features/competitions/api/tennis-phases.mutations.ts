// src/features/competitions/api/tennis-phases.mutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { TennisPhaseFormat } from "./tennis-phases.api";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type TennisGenerationMode = "with_matches" | "phases_only";

export interface GenerateTennisPhasesPayload {
  eventCategoryId: number;
  mode: TennisGenerationMode;
  format: TennisPhaseFormat;
  registrationIds: number[];
  generateMatches: boolean;
  groups: {
    name: string;
    format: TennisPhaseFormat;
    registrationIds: number[];
  }[];
}

// ─── API call ────────────────────────────────────────────────────────────────

async function generateTennisPhases(payload: GenerateTennisPhasesPayload) {
  const { data } = await apiClient.post(
    `/competitions/event-categories/${payload.eventCategoryId}/tennis/generate-phases`,
    {
      generateMatches: payload.generateMatches,
      groups: payload.groups,
    }
  );
  return data;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useGenerateTennisPhases() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateTennisPhases,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["phases", variables.eventCategoryId],
      });
    },
  });
}