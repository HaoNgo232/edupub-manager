import type { Role } from './auth.types';

export interface AdminUserListItem {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  avatarUrl: string | null;
  documentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserDetail extends AdminUserListItem {
  recentDocuments: Array<{
    id: string;
    title: string;
    subject: string;
    gradeLevel: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface GetAdminUsersParams {
  q?: string;
  role?: Role;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'email' | 'fullName' | 'role';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateAdminUserPayload {
  email: string;
  password?: string;
  fullName: string;
  role: Role;
  avatarUrl?: string;
}

export interface UpdateAdminUserPayload {
  email?: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface UpdateAdminUserRolePayload {
  role: Role;
}

export interface PaginatedAdminUsersResponse {
  items: AdminUserListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
