import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { athleteKeys } from "./athletes.queries";
import type { CreateAthleteData, UpdateAthleteData, Athlete } from "../types";

export const useCreateAthlete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAthleteData) => {
      const response = await apiClient.post<Athlete>(
        ENDPOINTS.ATHLETES.CREATE,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: athleteKeys.lists() });
    },
  });
};

export const useUpdateAthlete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateAthleteData;
    }) => {
      const response = await apiClient.patch<Athlete>(
        ENDPOINTS.ATHLETES.UPDATE(id),
        data,
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: athleteKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: athleteKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteAthlete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(ENDPOINTS.ATHLETES.DELETE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: athleteKeys.lists() });
    },
  });
};

export const useUploadAthletePhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file }: { id: number; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post<{ photoUrl: string }>(
        ENDPOINTS.ATHLETES.UPLOAD_PHOTO(id),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: athleteKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: athleteKeys.detail(variables.id),
      });
    },
  });
};
