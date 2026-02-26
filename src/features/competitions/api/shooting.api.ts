import { apiClient } from "@/lib/api/client";
import type { ShootingParticipant, ShootingScore } from '../types/shooting.types';

const BASE = '/competitions/shooting';

export const getShootingPhaseScores = (phaseId: number): Promise<ShootingParticipant[]> =>
  apiClient.get(`${BASE}/phases/${phaseId}/scores`).then((res) => res.data);

export const updateShootingScore = (
  participationId: number,
  data: { series: number[] },
): Promise<ShootingScore> =>
  apiClient.patch(`${BASE}/participations/${participationId}/score`, data).then((res) => res.data);

export const setShootingDns = (participationId: number): Promise<ShootingScore> =>
  apiClient.patch(`${BASE}/participations/${participationId}/dns`, {}).then((res) => res.data);

export const getShootingParticipationScore = (
  participationId: number,
): Promise<ShootingScore> =>
  apiClient.get(`${BASE}/participations/${participationId}/score`).then((res) => res.data);
