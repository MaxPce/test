import { useMutation, useQueryClient } from "@tanstack/react-query";
import { teamsApi } from "@/../src/features/institutions/api/teams.api";
import { teamKeys } from "@/../src/features/institutions/api/teams.queries";
import { eventCategoryKeys } from "@/features/events/api/eventCategories.queries";

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teamsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      queryClient.invalidateQueries({ queryKey: eventCategoryKeys.all });
      queryClient.invalidateQueries({ 
        queryKey: ['sismaster-event-categories'] 
      });
    },
  });
}

export function useAddTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: number; data: any }) =>
      teamsApi.addMember(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      queryClient.invalidateQueries({ queryKey: eventCategoryKeys.all }); 
      queryClient.invalidateQueries({ 
        queryKey: ['sismaster-event-categories'] 
      });
    },
  });
}