import { apiClient } from "@/lib/api/client";

export const roundRobinApi = {
  initialize: async (data: { phaseId: number; registrationIds: number[] }) => {
    const response = await apiClient.post(
      "/competitions/round-robin/initialize",
      data
    );
    return response.data;
  },
};
