// src/features/competitions/api/tennis-phases.mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tennisPhasesApi } from './tennis-phases.api';
import type { TennisPhaseFormat } from './tennis-phases.api';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type TennisGenerationMode = 'with_matches' | 'phases_only';

export interface GenerateTennisPhasesPayload {
  groups: {
    name: string;
    format: TennisPhaseFormat;
    registrationIds: number[];
  }[];
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useGenerateTennisPhases() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventCategoryId,
      payload,
    }: {
      eventCategoryId: number;
      payload: GenerateTennisPhasesPayload;
    }) => tennisPhasesApi.generate(eventCategoryId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.some(
            (k) => k === variables.eventCategoryId
          ),
      });
    },
  });
}