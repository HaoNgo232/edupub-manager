import { apiFetch } from '../http/client';
import type {
  CreateDocumentRequest,
  DocumentListResponse,
  DocumentResponse,
  ListDocumentsParams,
  UpdateDocumentRequest,
} from '../types/document.types';

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
