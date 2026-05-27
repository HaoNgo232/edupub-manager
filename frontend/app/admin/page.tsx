'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { getAdminStats, AdminStatsResponse, ApiError } from '../../lib/api';
import SideNav from '../../components/SideNav';
import AdminSummaryCards from '../../components/admin/dashboard/AdminSummaryCards';
import DocumentsByStatusChart from '../../components/admin/dashboard/DocumentsByStatusChart';
import DocumentsBySubjectChart from '../../components/admin/dashboard/DocumentsBySubjectChart';
import DocumentsByGradeLevelChart from '../../components/admin/dashboard/DocumentsByGradeLevelChart';
import UsersByRoleSummary from '../../components/admin/dashboard/UsersByRoleSummary';
import RecentDocumentsTable from '../../components/admin/dashboard/RecentDocumentsTable';
import RecentUsersTable from '../../components/admin/dashboard/RecentUsersTable';
import DashboardSkeleton from '../../components/admin/dashboard/DashboardSkeleton';
import DashboardErrorState from '../../components/admin/dashboard/DashboardErrorState';

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Guard: only ADMIN is allowed, redirect unauthenticated to /login, user to /documents
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'ADMIN') {
        router.push('/documents');
      }
    }
  }, [user, authLoading, router]);

  const fetchStats = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setLoading(true);
    }
    setError(null);
    try {
      const stats = await getAdminStats();
      setData(stats);
    } catch (err) {
      if (err instanceof ApiError) {
        // Handle token expiration/auth errors
        if (err.statusCode === 401) {
          router.push('/login');
          return;
        }
        if (err.statusCode === 403) {
          router.push('/documents');
          return;
        }
        setError(err.errors.join(', '));
      } else {
        setError('Failed to load dashboard statistics.');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!authLoading && user?.role === 'ADMIN') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchStats();
    }
  }, [fetchStats, authLoading, user]);

  if (authLoading || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f5]">
        <span className="material-symbols-outlined animate-spin text-[32px] text-[#e5564b]">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      <SideNav />

      <div className="md:ml-64 flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-4 bg-[#faf9f5] border-b border-graphite-border">
          <div className="flex items-center gap-2 font-label-md text-[#76777b] pl-12 md:pl-0">
            <span className="material-symbols-outlined text-[18px] text-[#E4554A]">
              admin_panel_settings
            </span>
            <span className="text-[#030509] font-semibold">
              Admin Portal
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/documents/new"
              className="flex items-center gap-1.5 bg-[#E4554A] text-white font-label-md px-3 py-2 sm:px-4 rounded-sm hover:brightness-95 transition-all active:scale-[0.98]"
              title="New Document"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="hidden sm:inline">New Document</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-8 max-w-[1140px] w-full mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-graphite-border pb-6">
            <div>
              <h1 className="text-headline-lg text-ink-black">Dashboard</h1>
              <p className="font-body-md text-[#76777b] mt-2">
                Overview of users, documents, and system activity.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => fetchStats(true)}
                disabled={loading}
                className="px-4 py-2 bg-white border border-[#030509] text-[#030509] font-label-md text-label-md rounded-sm flex items-center hover:bg-[#e9e8e4] transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined mr-2 text-sm">refresh</span>
                Refresh
              </button>
              <Link
                href="/admin/documents"
                className="px-4 py-2 bg-[#e5564b] text-white border border-[#e5564b] font-label-md text-label-md rounded-sm flex items-center hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined mr-2 text-sm">folder_open</span>
                Manage Documents
              </Link>
              <Link
                href="/admin/users"
                className="px-4 py-2 bg-white border border-graphite-border text-[#76777b] font-label-md text-label-md rounded-sm flex items-center hover:bg-[#e9e8e4] transition-colors"
              >
                <span className="material-symbols-outlined mr-2 text-sm">group</span>
                Manage Users
              </Link>
            </div>
          </div>

          {error && !loading && (
            <DashboardErrorState onRetry={() => fetchStats(false)} errorMessage={error} />
          )}

          {loading && !data && (
            <DashboardSkeleton />
          )}

          {data && !error && (
            <>
              {/* Summary Cards */}
              <AdminSummaryCards summary={data.summary} />

              {/* Status & Subject Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-margin-edge">
                <DocumentsByStatusChart data={data.documentsByStatus} />
                <DocumentsBySubjectChart data={data.documentsBySubject} />
              </div>

              {/* Grade Level Chart & Users by Role */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-margin-edge">
                <div className="lg:col-span-2">
                  <DocumentsByGradeLevelChart data={data.documentsByGradeLevel} />
                </div>
                <div>
                  <UsersByRoleSummary usersByRole={data.usersByRole} />
                </div>
              </div>

              {/* Tables Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
                <RecentDocumentsTable documents={data.recentDocuments} />
                <RecentUsersTable users={data.recentUsers} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
