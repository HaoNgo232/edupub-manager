import { apiFetch } from '../http/client';
import type { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from '../types/auth.types';

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuthRedirect: true,
  });
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuthRedirect: true,
  });
}

export async function getMe(): Promise<UserResponse> {
  return apiFetch<UserResponse>('/auth/me');
}
