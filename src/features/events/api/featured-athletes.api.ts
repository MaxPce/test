import { apiClient } from '@/lib/api/client';
import type {
  FeaturedAthlete,
  CreateFeaturedAthleteData,
  UpdateFeaturedAthleteData,
} from '../types';

export const featuredAthletesApi = {
  getByEventCategory: (eventCategoryId: number) =>
    apiClient
      .get<FeaturedAthlete[]>(`/featured-athletes/event-category/${eventCategoryId}`)
      .then((r) => r.data),

  create: (body: CreateFeaturedAthleteData) =>
    apiClient.post<FeaturedAthlete>('/featured-athletes', body).then((r) => r.data),

  update: (id: number, body: UpdateFeaturedAthleteData) =>
    apiClient
      .patch<FeaturedAthlete>(`/featured-athletes/${id}`, body)
      .then((r) => r.data),

  remove: (id: number) =>
    apiClient.delete(`/featured-athletes/${id}`).then((r) => r.data),
};
