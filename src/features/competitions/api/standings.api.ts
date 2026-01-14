import { apiClient } from "@/lib/api/client";
import type { Standing } from "../types";

export const standingsApi = {
  getByPhase: async (phaseId: number): Promise<Standing[]> => {
    const response = await apiClient.get(
      `/competitions/phases/${phaseId}/standings`
    );
    return response.data;
  },

  update: async (phaseId: number): Promise<Standing[]> => {
    const response = await apiClient.post(
      `/competitions/phases/${phaseId}/standings/update`
    );
    return response.data;
  },
};
