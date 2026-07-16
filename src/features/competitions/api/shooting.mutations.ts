import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateShootingScore, setShootingDns, initializeShootingGroupPhase, generateShootingPhases  } from './shooting.api';
import { toast } from 'sonner';


export const useUpdateShootingScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      participationId,
      data,
    }: {
      participationId: number;
      data: { series: number[] };
    }) => updateShootingScore(participationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shooting-scores'] });
    },
  });
};

export const useSetShootingDns = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (participationId: number) => setShootingDns(participationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shooting-scores'] });
    },
  });
};

export const useInitializeShootingGroupPhase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      phaseId,
      registrationIds,
    }: {
      phaseId: number;
      registrationIds: number[];
    }) => initializeShootingGroupPhase(phaseId, registrationIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['shooting-scores', variables.phaseId],
      });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast.success('Fase de Tiro Deportivo inicializada correctamente');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Error al inicializar fase',
      );
    },
  });
};

export const useGenerateShootingPhases = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventCategoryId,
      phases,
    }: {
      eventCategoryId: number;
      phases: { name: string; registrationIds: number[] }[];
    }) => generateShootingPhases(eventCategoryId, phases),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phases'] });
      queryClient.invalidateQueries({ queryKey: ['shooting-scores'] });
      toast.success('Fases de Tiro Deportivo generadas correctamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al generar fases');
    },
  });
};
