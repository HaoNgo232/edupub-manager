import { apiFetch } from '../http/client';
import type { AdminStatsResponse } from '../types/admin-stats.types';

export async function getAdminStats(recentLimit?: number): Promise<AdminStatsResponse> {
  const url = recentLimit !== undefined ? `/admin/stats?recentLimit=${recentLimit}` : '/admin/stats';
  return apiFetch<AdminStatsResponse>(url);
}
