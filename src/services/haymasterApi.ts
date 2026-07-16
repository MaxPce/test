import { http } from './http';
import type { SportParam, AthleteSismaster } from '../features/competitions/types/sismaster.types';

export const haymasterApi = {
  getSportParamsByLocalSport: (
    localSportId: number,
    sismasterEventId: number,
  ) =>
    http.get<SportParam[]>(
      `/haymaster/sports/local/${localSportId}/params/by-event/${sismasterEventId}`,
    ),

  getAthletesByCategory: (
    sismasterEventId: number,
    localSportId: number,
    idparam: number,
  ) =>
    http.get<AthleteSismaster[]>(
      `/haymaster/athletes/by-category-local?sismasterEventId=${sismasterEventId}&localSportId=${localSportId}&idparam=${idparam}`,
    ),
};