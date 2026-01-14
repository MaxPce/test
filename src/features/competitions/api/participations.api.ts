import { apiClient } from "@/lib/api/client";
import type { Participation, CreateParticipationData } from "../types";

export const participationsApi = {
  create: async (data: CreateParticipationData): Promise<Participation> => {
    const response = await apiClient.post("/competitions/participations", data);
    return response.data;
  },

  getByMatch: async (matchId: number): Promise<Participation[]> => {
    const response = await apiClient.get(
      `/competitions/matches/${matchId}/participations`
    );
    return response.data;
  },

  delete: async (matchId: number, registrationId: number): Promise<void> => {
    await apiClient.delete(
      `/competitions/matches/${matchId}/participations/${registrationId}`
    );
  },
};
