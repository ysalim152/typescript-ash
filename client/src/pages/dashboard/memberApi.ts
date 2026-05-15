import { HttpError } from "./HttpError";
export interface Member {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
}

export interface PaginatedMembersResponse {
  members: Member[];
  totalPages: number;
  currentPage: number;
}

/**
 * Fetches all members (requires admin role).
 */
export const getMembers = async (token: string, page: number = 1, limit: number = 10, search: string = '', sortBy: string = 'created_at', sortOrder: 'asc' | 'desc' = 'desc'): Promise<PaginatedMembersResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder,
  });
  if (search) params.append('search', search);
  const response = await fetch(`/api/members?${params.toString()}`, {
    headers: { 'x-auth-token': token },
  });
  if (!response.ok) {
    throw new HttpError('Failed to fetch members', response.status);
  }
  return response.json();
};

/**
 * Fetches ALL members for export (no pagination).
 * Assumes a new backend endpoint `/api/members/all`.
 */
export const getAllMembers = async (token: string): Promise<Member[]> => {
  const response = await fetch(`/api/members/all`, {
    headers: { 'x-auth-token': token },
  });
  if (!response.ok) {
    throw new HttpError('Failed to fetch all members for export', response.status);
  }
  return response.json();
};

/**
 * Updates a member's role.
 * Assumes a new backend endpoint `/api/members/:id/role`.
 */
export const updateMemberRole = async ({ memberId, role, token }: { memberId: number; role: string; token: string }): Promise<Member> => {
  const response = await fetch(`/api/members/${memberId}/role`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token,
    },
    body: JSON.stringify({ role }),
  });
  if (!response.ok) {
    throw new HttpError('Failed to update member role', response.status);
  }
  return response.json();
};

/**
 * Deletes a member.
 * Assumes a new backend endpoint `DELETE /api/members/:id`.
 */
export const deleteMember = async ({ memberId, token }: { memberId: number; token: string }): Promise<void> => {
  const response = await fetch(`/api/members/${memberId}`, {
    method: 'DELETE',
    headers: {
      'x-auth-token': token,
    },
  });
  if (!response.ok) {
    throw new HttpError('Failed to delete member', response.status);
  }
};