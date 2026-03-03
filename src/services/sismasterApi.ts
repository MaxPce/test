import { http } from './http';
import type { SportParam, AthleteSismaster } from '../features/competitions/types/sismaster.types';

export const sismasterApi = {
  /**
   * Usa el ID LOCAL del deporte (de la URL, no el de Sismaster).
   * El mapping se hace en el backend.
   */
  getSportParamsByLocalSport: (
    localSportId: number,
    sismasterEventId: number,
  ) =>
    http.get<SportParam[]>(
      `/sismaster/sports/local/${localSportId}/params/by-event/${sismasterEventId}`,
    ),

  /**
   * Atletas por categoría, también usando localSportId.
   */
  getAthletesByCategory: (
    sismasterEventId: number,
    localSportId: number,
    idparam: number,
  ) =>
    http.get<AthleteSismaster[]>(
      `/sismaster/athletes/by-category-local?sismasterEventId=${sismasterEventId}&localSportId=${localSportId}&idparam=${idparam}`,
    ),
};
