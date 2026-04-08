export interface OperatorPermission {
  id: number;
  userId: number;
  sportId: number | null;
  eventId: number | null;
  eventSource: 'local' | 'sismaster' | null;  
  createdAt: string;
}

export interface OperatorPermissionSummary {
  sportIds: number[];
  eventIds: number[];
  permissions: OperatorPermission[];
}

export interface AssignPermissionPayload {
  userId: number;
  sportId?: number;
  eventId?: number;
  eventSource?: 'local' | 'sismaster';  
}