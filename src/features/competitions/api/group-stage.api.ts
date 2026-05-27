import { apiClient } from "@/lib/api/client";
import type { Phase } from "../types";

export interface GroupDefinition {
  label: string;
  registrationIds: number[];
}

export interface CreateGroupStagePayload {
  parentPhaseId: number;
  groups: GroupDefinition[];
  qualifiersPerGroup: number;
}

export interface GroupStanding {
  groupStandingId: number;
  phaseId: number;
  participantId: number;
  participantName: string;
  institutionName: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDifference: number;
  points: number;
  qualified: boolean;
  finalRank: number | null;
}

export const groupStageApi = {
  createGroups: async (payload: CreateGroupStagePayload): Promise<Phase[]> => {
    const { data } = await apiClient.post(
      `/competitions/phases/${payload.parentPhaseId}/group-stage`,
      payload,
    );
    return data;
  },

  closeGroups: async (parentPhaseId: number): Promise<number[]> => {
    const { data } = await apiClient.post(
      `/competitions/phases/${parentPhaseId}/close-groups`,
    );
    return data;
  },

  getStandings: async (groupPhaseId: number): Promise<GroupStanding[]> => {
    const { data } = await apiClient.get(
      `/competitions/phases/${groupPhaseId}/group-standings`,
    );
    return data;
  },
};