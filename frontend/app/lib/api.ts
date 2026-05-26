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

export class ApiError extends Error {
  statusCode: number;
  errors: string[];

  constructor(statusCode: number, errors: string[]) {
    super(errors[0] || 'API Error');
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit & { skipAuthRedirect?: boolean } = {},
): Promise<T> {
  const { skipAuthRedirect = false, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);

  if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    let errorMessages: string[] = [];
    const statusCode = response.status;

    try {
      const errorData = await response.json();
      if (errorData && typeof errorData === 'object') {
        if (Array.isArray(errorData.message)) {
          errorMessages = errorData.message;
        } else if (typeof errorData.message === 'string') {
          errorMessages = [errorData.message];
        } else if (typeof errorData.error === 'string') {
          errorMessages = [errorData.error];
        }
      }
    } catch {
      // ignore JSON parse error
    }

    if (errorMessages.length === 0) {
      errorMessages = [response.statusText || `Request failed with status ${statusCode}`];
    }

    if (statusCode === 401 && !skipAuthRedirect) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
    }

    throw new ApiError(statusCode, errorMessages);
  }

  if (response.status === 204) {
    return {} as T;
  }

  try {
    return await response.json();
  } catch {
    return {} as T;
  }
}

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

export async function getMyProfile(): Promise<UserResponse> {
  return apiFetch<UserResponse>('/users/me');
}

export async function updateMyProfile(data: UpdateMyProfileRequest): Promise<UserResponse> {
  return apiFetch<UserResponse>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
