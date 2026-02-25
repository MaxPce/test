import { apiClient } from "@/lib/api/client";
import type {
  AthleticsParticipant,
  UpdateAthleticsTimeDto,
} from "../types/athletics.types";

// GET /competitions/athletics/phases/:phaseId/results
export const getAthleticsResultsTable = async (phaseId: number) => {
  const response = await apiClient.get<AthleticsParticipant[]>(
    `/competitions/athletics/phases/${phaseId}/results`,
  );
  return response.data;
};

// PATCH /competitions/athletics/participations/:participationId/time
export const updateAthleticsTime = async (
  participationId: number,
  data: UpdateAthleticsTimeDto,
) => {
  const response = await apiClient.patch(
    `/competitions/athletics/participations/${participationId}/time`,
    data,
  );
  return response.data;
};
