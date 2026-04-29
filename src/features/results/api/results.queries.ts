import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resultsApi, type CreateTimeResultDto } from "@/services/resultsApi";
import { apiClient } from "@/lib/api/client";

export function useSwimmingResults(eventCategoryId: number | null) {
  return useQuery({
    queryKey: ["swimming-results", eventCategoryId],
    queryFn: () => resultsApi.getSwimmingResults(eventCategoryId!),
    enabled: eventCategoryId !== null,
  });
}

export function usePoomsaeResults(eventCategoryId: number) {
  return useQuery({
    queryKey: ["poomsae-results", eventCategoryId],
    queryFn: () => resultsApi.getPoomsaeResults(eventCategoryId),
    enabled: eventCategoryId > 0,
  });
}

export function usePhaseResults(phaseId: number) {
  return useQuery({
    queryKey: ["phase-results", phaseId],
    queryFn: () => resultsApi.getPhaseResults(phaseId),
    enabled: phaseId > 0,
  });
}

export function useCreateTimeResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resultsApi.createTimeResult,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["swimming-results"] });
      queryClient.invalidateQueries({ queryKey: ["phase-results"] }); 
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
      queryClient.invalidateQueries({ queryKey: ["phase-results"] }); 
    },
  });
}

export function useDeleteTimeResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resultsApi.deleteTimeResult,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["swimming-results"] });
      queryClient.invalidateQueries({ queryKey: ["phase-results"] }); 
    },
  });
}

export function useCreateDNSResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ registrationId, phaseId }: { registrationId: number; phaseId: number }) =>
      resultsApi.createDNSResult(registrationId, phaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phase-results"] });
      queryClient.invalidateQueries({ queryKey: ["swimming-results"] });
    },
  });
}

export function useCreateDNFResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ registrationId, phaseId }: { registrationId: number; phaseId: number }) =>
      resultsApi.createDNFResult(registrationId, phaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phase-results"] });
      queryClient.invalidateQueries({ queryKey: ["swimming-results"] });
    },
  });
}


export function useCreateDQResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ registrationId, phaseId }: { registrationId: number; phaseId: number }) =>
      resultsApi.createDQResult(registrationId, phaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phase-results"] });
      queryClient.invalidateQueries({ queryKey: ["swimming-results"] });
    },
  });
}
