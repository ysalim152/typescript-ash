import { HttpError } from "./HttpError";

export interface AuditLog {
  id: number;
  user_name: string; // Name of the admin who performed the action
  action_type: string; // e.g., 'CREATE_ACTIVITY', 'DELETE_MEMBER'
  target_type: string; // e.g., 'Activity', 'Member'
  target_id: number | null;
  target_descriptor: string; // A readable descriptor of the target, e.g., member's email or activity name
  created_at: string;
}

export interface PaginatedAuditLogsResponse {
  logs: AuditLog[];
  totalPages: number;
  currentPage: number;
}

/**
 * Fetches audit logs (requires admin role).
 */
export const getAuditLogs = async (token: string, page: number = 1, limit: number = 15, sortBy: string = 'created_at', sortOrder: 'asc' | 'desc' = 'desc'): Promise<PaginatedAuditLogsResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder,
  });

  const response = await fetch(`/api/audit-logs?${params.toString()}`, {
    headers: { 'x-auth-token': token },
  });
  if (!response.ok) {
    throw new HttpError('Failed to fetch audit logs', response.status);
  }
  return response.json();
};