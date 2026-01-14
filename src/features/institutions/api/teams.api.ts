import { apiClient } from "@/lib/api-client";

export const teamsApi = {
  getAll: async (params?: { institutionId?: number; categoryId?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.institutionId)
      searchParams.append("institutionId", String(params.institutionId));
    if (params?.categoryId)
      searchParams.append("categoryId", String(params.categoryId));

    const query = searchParams.toString();
    const url = query ? `/institutions/teams?${query}` : "/institutions/teams";

    const response = await apiClient.get(url);
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await apiClient.get(`/institutions/teams/${id}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    institutionId: number;
    categoryId: number;
  }) => {
    const response = await apiClient.post("/institutions/teams", data);
    return response.data;
  },

  addMember: async (
    teamId: number,
    data: { athleteId: number; rol: string }
  ) => {
    const response = await apiClient.post(
      `/institutions/teams/${teamId}/members`,
      data
    );
    return response.data;
  },

  removeMember: async (teamId: number, athleteId: number) => {
    const response = await apiClient.delete(
      `/institutions/teams/${teamId}/members/${athleteId}`
    );
    return response.data;
  },
};
