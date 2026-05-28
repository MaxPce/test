import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type TennisGenerationMode = "with_matches" | "phases_only";

export interface GenerateTennisPhasesPayload {
  eventCategoryId: number;
  mode: TennisGenerationMode;
  registrationIds: number[];
}

// ─── API call ────────────────────────────────────────────────────────────────

async function generateTennisPhases(payload: GenerateTennisPhasesPayload) {
  const { data } = await apiClient.post(
    `/tennis-phases/${payload.eventCategoryId}/generate`,
    {
      mode: payload.mode,
      registrationIds: payload.registrationIds,
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
      // Invalida las fases de la categoría para que el PhaseGrid se refresque
      queryClient.invalidateQueries({
        queryKey: ["phases", variables.eventCategoryId],
      });
    },
  });
}