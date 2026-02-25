import { apiClient } from "@/lib/api/client";
import type {
  SwimmingParticipant,
  UpdateSwimmingTimeDto,
} from "../types/swimming.types";

// GET /competitions/swimming/phases/:phaseId/results
export const getSwimmingResultsTable = async (phaseId: number) => {
  const response = await apiClient.get<SwimmingParticipant[]>(
    `/competitions/swimming/phases/${phaseId}/results`,
  );
  return response.data;
};

// PATCH /competitions/swimming/participations/:participationId/time
export const updateSwimmingTime = async (
  participationId: number,
  data: UpdateSwimmingTimeDto,
) => {
  const response = await apiClient.patch(
    `/competitions/swimming/participations/${participationId}/time`,
    data,
  );
  return response.data;
};
