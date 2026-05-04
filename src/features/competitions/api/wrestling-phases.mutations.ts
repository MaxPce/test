import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { GenerateWrestlingPhasesDto } from './wrestling-phases.api';

export function useGenerateWrestlingPhases() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventCategoryId, groups }: GenerateWrestlingPhasesDto) => {
      const { data } = await apiClient.post(
        `/competitions/event-categories/${eventCategoryId}/wrestling/generate-phases`,
        { groups },
      );
      return data;
    },
    onSuccess: (_data, { eventCategoryId }) => {
      queryClient.invalidateQueries({ queryKey: ['phases', eventCategoryId] });
    },
  });
}