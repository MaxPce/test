import { apiClient } from "@/lib/api/client";

export const bestOf3Api = {
  initialize: async (data: { phaseId: number; registrationIds: number[] }) => {
    const response = await apiClient.post(
      `/competitions/phases/${data.phaseId}/initialize-best-of-3`,
      { registrationIds: data.registrationIds }
    );
    return response.data;
  },

  updateResult: async (matchId: number, winnerRegistrationId: number) => {
    const response = await apiClient.patch(
      `/competitions/matches/${matchId}/best-of-3-result`,
      { winnerRegistrationId }
    );
    return response.data;
  },
};
