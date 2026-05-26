export type Role = 'USER' | 'ADMIN';

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
}

export interface RegisterRequest {
  email: string;
  password?: string;
  fullName?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface UpdateMyProfileRequest {
  fullName?: string;
  avatarUrl?: string;
}
