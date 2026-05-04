export type WrestlingPhaseFormat = 'single_elimination' | 'round_robin' | 'best_of_3';

export interface GenerateWrestlingPhasesDto {
  eventCategoryId: number;
  groups: {
    name: string;
    format: WrestlingPhaseFormat;
    registrationIds: number[];
  }[];
}