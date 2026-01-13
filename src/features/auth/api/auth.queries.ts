import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { UserProfile } from "../types";

export const authKeys = {
  all: ["auth"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
};

export const useProfile = () => {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: async () => {
      const { data } = await apiClient.get<UserProfile>(ENDPOINTS.AUTH.PROFILE);
      return data;
    },
  });
};
