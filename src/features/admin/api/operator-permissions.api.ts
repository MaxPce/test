import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  OperatorPermission,
  OperatorPermissionSummary,
  AssignPermissionPayload,
} from '../types/operator-permission.types';

export const operatorPermissionsApi = {
  assign: async (payload: AssignPermissionPayload): Promise<OperatorPermission> => {
    const { data } = await apiClient.post<OperatorPermission>(
      ENDPOINTS.OPERATOR_PERMISSIONS.BASE,
      payload,
    );
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.OPERATOR_PERMISSIONS.REMOVE(id));
  },

  getByUser: async (userId: number): Promise<OperatorPermission[]> => {
    const { data } = await apiClient.get<OperatorPermission[]>(
      ENDPOINTS.OPERATOR_PERMISSIONS.BY_USER(userId),
    );
    return data;
  },

  getSummary: async (userId: number): Promise<OperatorPermissionSummary> => {
    const { data } = await apiClient.get<OperatorPermissionSummary>(
      ENDPOINTS.OPERATOR_PERMISSIONS.SUMMARY(userId),
    );
    return data;
  },

  getMyPermissions: async (): Promise<OperatorPermissionSummary> => {
    const { data } = await apiClient.get<OperatorPermissionSummary>(
      ENDPOINTS.OPERATOR_PERMISSIONS.MY_PERMISSIONS,
    );
    return data;
  },
};