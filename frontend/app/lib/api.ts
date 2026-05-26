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

// ─── Feature 02: Documents ────────────────────────────────────────────────────

export type DocumentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type Subject =
  | 'MATH'
  | 'LITERATURE'
  | 'ENGLISH'
  | 'PHYSICS'
  | 'CHEMISTRY'
  | 'BIOLOGY'
  | 'HISTORY'
  | 'GEOGRAPHY'
  | 'OTHER';

export interface DocumentOwner {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  avatarUrl: string | null;
}

export interface DocumentResponse {
  id: string;
  title: string;
  description: string | null;
  subject: Subject;
  gradeLevel: number;
  status: DocumentStatus;
  coverImageUrl: string | null;
  fileUrl: string | null;
  ownerId: string;
  owner: DocumentOwner;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface DocumentListResponse {
  items: DocumentResponse[];
  meta: PaginationMeta;
}

export interface CreateDocumentRequest {
  title: string;
  description?: string;
  subject: Subject;
  gradeLevel: number;
  status?: DocumentStatus;
  coverImageUrl?: string;
  fileUrl?: string;
}

export interface UpdateDocumentRequest {
  title?: string;
  description?: string;
  subject?: Subject;
  gradeLevel?: number;
  status?: DocumentStatus;
  coverImageUrl?: string;
  fileUrl?: string;
}

export interface ListDocumentsParams {
  q?: string;
  subject?: Subject;
  status?: DocumentStatus;
  gradeLevel?: number;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'gradeLevel';
  sortOrder?: 'asc' | 'desc';
}

export async function listDocuments(params: ListDocumentsParams = {}): Promise<DocumentListResponse> {
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.subject) query.set('subject', params.subject);
  if (params.status) query.set('status', params.status);
  if (params.gradeLevel !== undefined) query.set('gradeLevel', String(params.gradeLevel));
  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.limit !== undefined) query.set('limit', String(params.limit));
  if (params.sortBy) query.set('sortBy', params.sortBy);
  if (params.sortOrder) query.set('sortOrder', params.sortOrder);
  const qs = query.toString();
  return apiFetch<DocumentListResponse>(`/documents${qs ? `?${qs}` : ''}`);
}

export async function getDocument(id: string): Promise<DocumentResponse> {
  return apiFetch<DocumentResponse>(`/documents/${id}`);
}

export async function createDocument(data: CreateDocumentRequest): Promise<DocumentResponse> {
  return apiFetch<DocumentResponse>('/documents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateDocument(id: string, data: UpdateDocumentRequest): Promise<DocumentResponse> {
  return apiFetch<DocumentResponse>(`/documents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteDocument(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/documents/${id}`, {
    method: 'DELETE',
  });
}
