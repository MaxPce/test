import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { registrationKeys } from "./registrations.queries";
import { eventCategoryKeys } from "./eventCategories.queries";
import type {
  CreateRegistrationData,
  BulkRegistrationData,
  Registration,
  CreateLocalAthleteRegistrationData,
  CreateLocalTeamData,   
} from "../types";

export const useCreateRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRegistrationData) => {
      const response = await apiClient.post<Registration>(
        ENDPOINTS.REGISTRATIONS.CREATE,
        data,
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.all });
      queryClient.invalidateQueries({ queryKey: eventCategoryKeys.all });
      queryClient.invalidateQueries({ 
        queryKey: ['sismaster-event-categories'] 
      });
    },
  });
};

export const useBulkRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkRegistrationData) => {
      const response = await apiClient.post(ENDPOINTS.REGISTRATIONS.BULK, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.all });
      queryClient.invalidateQueries({ queryKey: eventCategoryKeys.all });
    },
  });
};

export const useDeleteRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(ENDPOINTS.REGISTRATIONS.DELETE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: eventCategoryKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ["sismaster-event-categories"],
      });
    },
  });
};

export const useUpdateRegistrationSeed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      registrationId,
      seedNumber,
    }: {
      registrationId: number;
      seedNumber: number | null;
    }) => {
      const response = await apiClient.patch(
        ENDPOINTS.REGISTRATIONS.UPDATE_SEED(registrationId),
        { seedNumber },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: eventCategoryKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ["sismaster-event-categories"],
      });
      queryClient.invalidateQueries({
        queryKey: registrationKeys.all,
      });
    },
  });
};

export const useBulkRegistrationFromSismaster = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      eventCategoryId: number;
      external_athlete_ids: number[];
    }) => {
      console.log("🌐 [Mutation] Llamando al backend con:", data);

      const response = await apiClient.post(
        "/events/registrations/bulk-sismaster",
        data,
      );

      return response.data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: eventCategoryKeys.all,
      });

      await queryClient.invalidateQueries({
        queryKey: ["sismaster-event-categories"],
      });

      await queryClient.refetchQueries({
        queryKey: eventCategoryKeys.all,
        type: "active",
      });

      await queryClient.refetchQueries({
        queryKey: ["sismaster-event-categories"],
        type: "active",
      });
    },
    onError: (error) => {
      console.error("[Mutation] Error:", error);
    },
  });
};

export const useBulkRegistrationFromHaymaster = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      eventCategoryId: number;
      external_athlete_ids: number[];
    }) => {
      console.log("🌐 [Mutation Haymaster] Llamando al backend con:", data);
      const response = await apiClient.post(
        "/events/registrations/bulk-haymaster",
        data,
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: eventCategoryKeys.all });
      await queryClient.invalidateQueries({ queryKey: ["haymaster-event-categories"] });
      await queryClient.refetchQueries({ queryKey: eventCategoryKeys.all, type: "active" });
    },
    onError: (error) => {
      console.error("[Mutation Haymaster] Error:", error);
    },
  });
};

export const useCreateLocalAthleteRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLocalAthleteRegistrationData) => {
      const response = await apiClient.post<Registration>(
        ENDPOINTS.REGISTRATIONS.LOCAL_ATHLETE,
        data,
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: eventCategoryKeys.all });
      await queryClient.invalidateQueries({ queryKey: registrationKeys.all });
      await queryClient.refetchQueries({ queryKey: eventCategoryKeys.all, type: "active" });
      await queryClient.refetchQueries({ queryKey: registrationKeys.all, type: "active" });
    },
    onError: (error) => {
      console.error("[LocalAthlete] Error al registrar atleta local:", error);
    },
  });
};

export const useCreateLocalTeamRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventCategoryId,
      localTeam,
    }: {
      eventCategoryId: number;
      localTeam: CreateLocalTeamData;
    }) => {
      // 1. Crear el equipo local con sus atletas en una sola llamada
      const teamResponse = await apiClient.post(
        ENDPOINTS.TEAMS.LOCAL,
        localTeam,
      );
      const team = teamResponse.data;

      // 2. Inscribir el equipo en la categoría
      const regResponse = await apiClient.post<Registration>(
        ENDPOINTS.REGISTRATIONS.CREATE,
        { eventCategoryId, teamId: team.teamId },
      );

      // 3. Obtener la registration completa con team+members+institution anidados
      const fullResponse = await apiClient.get<Registration>(
        ENDPOINTS.REGISTRATIONS.DETAIL(regResponse.data.registrationId),
      );
      return fullResponse.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: eventCategoryKeys.all });
      await queryClient.invalidateQueries({ queryKey: registrationKeys.all });
      await queryClient.refetchQueries({ queryKey: eventCategoryKeys.all, type: "active" });
      await queryClient.refetchQueries({ queryKey: registrationKeys.all, type: "active" });
    },
    onError: (error) => {
      console.error("[LocalTeam] Error al crear equipo local:", error);
    },
  });
};