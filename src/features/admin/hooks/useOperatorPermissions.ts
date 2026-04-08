import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { operatorPermissionsApi } from "../api/operator-permissions.api";
import type { AssignPermissionPayload } from "../types/operator-permission.types";

export const operatorPermissionKeys = {
  all: ["operator-permissions"] as const,
  byUser: (userId: number) =>
    [...operatorPermissionKeys.all, "user", userId] as const,
};

export const useOperatorPermissionsByUser = (userId: number) => {
  return useQuery({
    queryKey: operatorPermissionKeys.byUser(userId),
    queryFn: () => operatorPermissionsApi.getByUser(userId),
    enabled: !!userId,
  });
};

export const useAssignPermission = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignPermissionPayload) =>
      operatorPermissionsApi.assign(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: operatorPermissionKeys.byUser(userId),
      });
    },
  });
};

export const useRemovePermission = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => operatorPermissionsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: operatorPermissionKeys.byUser(userId),
      });
    },
  });
};