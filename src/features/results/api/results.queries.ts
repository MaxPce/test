import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resultsApi, type CreateTimeResultDto } from "@/services/resultsApi";

export function useSwimmingResults(eventCategoryId: number | null) {
  return useQuery({
    queryKey: ["swimming-results", eventCategoryId],
    queryFn: () => resultsApi.getSwimmingResults(eventCategoryId!),
    enabled: eventCategoryId !== null,
  });
}

export function useCreateTimeResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resultsApi.createTimeResult,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["swimming-results"] });
    },
  });
}

export function useUpdateTimeResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      resultId,
      data,
    }: {
      resultId: number;
      data: Partial<CreateTimeResultDto>;
    }) => resultsApi.updateTimeResult(resultId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["swimming-results"] });
    },
  });
}

export function useDeleteTimeResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resultsApi.deleteTimeResult,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["swimming-results"] });
    },
  });
}
