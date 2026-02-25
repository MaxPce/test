import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

// ── Fetch participantes de una fase ──
export function usePhaseRegistrations(phaseId: number | null) {
  return useQuery({
    queryKey: ['phase-registrations', phaseId],
    queryFn: async () => {
      const res = await apiClient.get(
        `/competitions/phases/${phaseId}/registrations`,
      );
      return res.data as Array<{
        phaseRegistrationId: number;
        registrationId: number;
        registration: any;
      }>;
    },
    enabled: !!phaseId && phaseId > 0,
  });
}

// ── Asignar participante a fase ──
export function useAssignPhaseRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      phaseId,
      registrationId,
    }: {
      phaseId: number;
      registrationId: number;
    }) => {
      const res = await apiClient.post(
        `/competitions/phases/${phaseId}/registrations`,
        { registrationId },
      );
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['phase-registrations', variables.phaseId],
      });
    },
  });
}

// ── Remover participante de fase ──
export function useRemovePhaseRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      phaseId,
      registrationId,
    }: {
      phaseId: number;
      registrationId: number;
    }) => {
      const res = await apiClient.delete(
        `/competitions/phases/${phaseId}/registrations/${registrationId}`,
      );
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['phase-registrations', variables.phaseId],
      });
    },
  });
}
