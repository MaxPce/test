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

  // ✅ MODIFICAR ESTE MÉTODO
  getOne: async (id: number): Promise<Match> => {
    // Primero intentar obtener con relaciones completas desde table-tennis
    try {
      const response = await apiClient.get(
        `/competitions/matches/${id}/table-tennis`
      );
      return response.data.match; // El endpoint de table-tennis devuelve { match, lineups, games }
    } catch (error) {
      // Si falla (por ejemplo, no es tenis de mesa), usar el endpoint normal
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
};
