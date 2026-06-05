import { apiClient } from "@/lib/api/client";
import type { Match, CreateMatchData, UpdateMatchData } from "../types";

export const matchesApi = {
  getAll: async (phaseId?: number, status?: string): Promise<Match[]> => {
    const params = new URLSearchParams();
    if (phaseId) params.append("phaseId", String(phaseId));
    if (status) params.append("status", status);

    const query = params.toString();
    const url = query
      ? `/competitions/matches?${query}`
      : "/competitions/matches";

    const response = await apiClient.get(url);
    return response.data;
  },

  // Trae los matches de la fase padre + los IDs de clasificados disponibles
  // para asignación manual en brackets generados desde fase de grupos.
  getWithQualifiers: async (
    phaseId: number
  ): Promise<{
    matches: Match[];
    qualifiedRegistrationIds: number[];
  }> => {
    const [matchesResponse, registrationsResponse] = await Promise.all([
      apiClient.get(`/competitions/matches?phaseId=${phaseId}`),
      apiClient.get(`/competitions/phases/${phaseId}/registrations`),
    ]);

    const matches: Match[] = matchesResponse.data;
    const qualifiedRegistrationIds: number[] = (
      registrationsResponse.data as Array<{ registrationId: number }>
    ).map((pr) => pr.registrationId);

    return { matches, qualifiedRegistrationIds };
  },

  getOne: async (id: number): Promise<Match> => {
    try {
      const response = await apiClient.get(
        `/competitions/matches/${id}/table-tennis`
      );
      return response.data.match;
    } catch {
      const response = await apiClient.get(`/competitions/matches/${id}`);
      return response.data;
    }
  },

  create: async (data: CreateMatchData): Promise<Match> => {
    const response = await apiClient.post("/competitions/matches", data);
    return response.data;
  },

  update: async (id: number, data: UpdateMatchData): Promise<Match> => {
    const response = await apiClient.patch(`/competitions/matches/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/competitions/matches/${id}`);
  },

  swapParticipants: async (matchId: number): Promise<void> => {
    await apiClient.patch(`/competitions/matches/${matchId}/swap-participants`);
  },

};