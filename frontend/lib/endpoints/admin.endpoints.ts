import { apiFetch } from '../http/client';
import type { AdminStatsResponse } from '../types/admin-stats.types';
import type { DocumentListResponse, ListDocumentsParams } from '../types/document.types';

export async function getAdminStats(recentLimit?: number): Promise<AdminStatsResponse> {
  const url = recentLimit !== undefined ? `/admin/stats?recentLimit=${recentLimit}` : '/admin/stats';
  return apiFetch<AdminStatsResponse>(url);
}

export async function listAllDocuments(params: ListDocumentsParams = {}): Promise<DocumentListResponse> {
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
  return apiFetch<DocumentListResponse>(`/admin/documents${qs ? `?${qs}` : ''}`);
}
