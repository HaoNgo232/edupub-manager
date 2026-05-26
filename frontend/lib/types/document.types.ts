import type { Role } from './auth.types';

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
