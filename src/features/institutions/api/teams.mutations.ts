import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { teamKeys } from "./teams.queries";
import type {
  CreateTeamData,
  UpdateTeamData,
  Team,
  AddTeamMemberData,
  UpdateTeamMemberRoleData,
} from "../types";

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTeamData) => {
      const response = await apiClient.post<Team>(ENDPOINTS.TEAMS.CREATE, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateTeamData }) => {
      const response = await apiClient.patch<Team>(
        ENDPOINTS.TEAMS.UPDATE(id),
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: teamKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(ENDPOINTS.TEAMS.DELETE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
};

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teamId,
      data,
    }: {
      teamId: number;
      data: AddTeamMemberData;
    }) => {
      const response = await apiClient.post(
        ENDPOINTS.TEAMS.ADD_MEMBER(teamId),
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.detail(variables.teamId),
      });
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teamId,
      athleteId,
    }: {
      teamId: number;
      athleteId: number;
    }) => {
      await apiClient.delete(ENDPOINTS.TEAMS.REMOVE_MEMBER(teamId, athleteId));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.detail(variables.teamId),
      });
    },
  });
};

export const useUpdateTeamMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teamId,
      athleteId,
      data,
    }: {
      teamId: number;
      athleteId: number;
      data: UpdateTeamMemberRoleData;
    }) => {
      const response = await apiClient.patch(
        `${ENDPOINTS.TEAMS.ADD_MEMBER(teamId)}/${athleteId}/role`,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.detail(variables.teamId),
      });
    },
  });
};
