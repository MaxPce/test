import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { GenerateWushuPhasesDto } from './wushu-phases.api';

export function useGenerateWushuPhases() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventCategoryId, groups }: GenerateWushuPhasesDto) => {
      const { data } = await apiClient.post(
        `/competitions/event-categories/${eventCategoryId}/wushu/generate-phases`,
        { groups },
      );
      return data;
    },
    onSuccess: (_data, { eventCategoryId }) => {
      queryClient.invalidateQueries({ queryKey: ['phases', eventCategoryId] });
    },
  });
}