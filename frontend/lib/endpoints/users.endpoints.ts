import { apiFetch } from '../http/client';
import type { UpdateMyProfileRequest, UserResponse } from '../types/auth.types';

export async function getMyProfile(): Promise<UserResponse> {
  return apiFetch<UserResponse>('/users/me');
}

export async function updateMyProfile(data: UpdateMyProfileRequest): Promise<UserResponse> {
  return apiFetch<UserResponse>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
