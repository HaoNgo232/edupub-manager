import { apiFetch } from '../http/client';
import type { UpdateMyProfileRequest, UserResponse } from '../types/auth.types';
import type {
  AdminUserListItem,
  AdminUserDetail,
  GetAdminUsersParams,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
  UpdateAdminUserRolePayload,
  PaginatedAdminUsersResponse,
} from '../types/admin-users.types';

export async function getMyProfile(): Promise<UserResponse> {
  return apiFetch<UserResponse>('/users/me');
}

export async function updateMyProfile(data: UpdateMyProfileRequest): Promise<UserResponse> {
  return apiFetch<UserResponse>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function getAdminUsers(params: GetAdminUsersParams): Promise<PaginatedAdminUsersResponse> {
  const query = new URLSearchParams();
  if (params.q) query.append('q', params.q);
  if (params.role) query.append('role', params.role);
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());
  if (params.sortBy) query.append('sortBy', params.sortBy);
  if (params.sortOrder) query.append('sortOrder', params.sortOrder);

  const queryString = query.toString();
  return apiFetch<PaginatedAdminUsersResponse>(`/admin/users${queryString ? `?${queryString}` : ''}`);
}

export async function getAdminUserById(id: string): Promise<AdminUserDetail> {
  return apiFetch<AdminUserDetail>(`/admin/users/${id}`);
}

export async function createAdminUser(payload: CreateAdminUserPayload): Promise<AdminUserListItem> {
  return apiFetch<AdminUserListItem>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminUser(id: string, payload: UpdateAdminUserPayload): Promise<AdminUserListItem> {
  return apiFetch<AdminUserListItem>(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminUserRole(id: string, payload: UpdateAdminUserRolePayload): Promise<AdminUserListItem> {
  return apiFetch<AdminUserListItem>(`/admin/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminUser(id: string): Promise<void> {
  return apiFetch<void>(`/admin/users/${id}`, {
    method: 'DELETE',
  });
}
