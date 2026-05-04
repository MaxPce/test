export type WushuPhaseFormat = 'single_elimination' | 'round_robin' | 'best_of_3';

export interface GenerateWushuPhasesDto {
  eventCategoryId: number;
  groups: {
    name: string;
    format: WushuPhaseFormat;
    registrationIds: number[];
  }[];
}