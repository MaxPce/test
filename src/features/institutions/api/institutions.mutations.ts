import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { institutionKeys } from "./institutions.queries";
import type {
  CreateInstitutionData,
  UpdateInstitutionData,
  Institution,
} from "../types";

export const useCreateInstitution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInstitutionData) => {
      const response = await apiClient.post<Institution>(
        ENDPOINTS.INSTITUTIONS.CREATE,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: institutionKeys.lists() });
    },
  });
};

export const useUpdateInstitution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateInstitutionData;
    }) => {
      const response = await apiClient.patch<Institution>(
        ENDPOINTS.INSTITUTIONS.UPDATE(id),
        data,
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: institutionKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: institutionKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteInstitution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(ENDPOINTS.INSTITUTIONS.DELETE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: institutionKeys.lists() });
    },
  });
};

export const useUploadInstitutionLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file }: { id: number; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post<{ logoUrl: string }>(
        ENDPOINTS.INSTITUTIONS.UPLOAD_LOGO(id),
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
      queryClient.invalidateQueries({ queryKey: institutionKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: institutionKeys.detail(variables.id),
      });
    },
  });
};
