'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAdminUserById, updateAdminUser, AdminUserDetail } from '../../../../../lib/api';
import { useAuth } from '../../../../context/AuthContext';
import SideNav from '../../../../../components/SideNav';
import AdminUserForm from '../../../../../components/admin/users/AdminUserForm';

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [userDetail, setUserDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Role guard
  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== 'ADMIN')) {
      router.push('/documents');
    }
  }, [currentUser, authLoading, router]);

  const fetchUser = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminUserById(id);
      setUserDetail(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to load user details.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!authLoading && currentUser?.role === 'ADMIN') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchUser();
    }
  }, [fetchUser, authLoading, currentUser]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFormSubmit = async (values: { email: string; fullName: string; avatarUrl?: string }) => {
    if (!id) return;

    await updateAdminUser(id, {
      email: values.email,
      fullName: values.fullName,
      avatarUrl: values.avatarUrl,
    });

    showToast('User updated successfully.');
    // Delay to let the toast show, then redirect
    setTimeout(() => {
      router.push(`/admin/users/${id}`);
    }, 1000);
  };

  if (authLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f5]">
        <span className="material-symbols-outlined animate-spin text-[32px] text-[#e5564b]">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      <SideNav />

      <div className="md:ml-64 flex-1 flex flex-col min-h-screen overflow-x-hidden relative">
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-[#030509] text-white font-label-md px-5 py-3 shadow-lg border border-graphite-border flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-emerald-500">check_circle</span>
            {toastMessage}
          </div>
        )}

        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-4 bg-[#faf9f5] border-b border-graphite-border">
          <div className="flex items-center gap-2 font-label-md text-[#76777b] pl-12 md:pl-0">
            <span className="material-symbols-outlined text-[18px] text-[#E4554A]">admin_panel_settings</span>
            <span className="text-[#030509] font-semibold">Admin — Edit User</span>
          </div>
          <button
            onClick={() => router.push(`/admin/users/${id}`)}
            className="flex items-center gap-1 font-label-md text-[#5d636f] hover:text-[#030509] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Details</span>
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 md:px-8 py-8 max-w-[650px] w-full mx-auto space-y-6">
          <div>
            <h2 className="text-headline-lg text-[#030509]">Edit User</h2>
            <p className="font-label-md text-[#76777b] mt-1">
              Update user details. Role updates are managed separately on the details page.
            </p>
          </div>

          {loading && (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined animate-spin text-[32px] text-[#e5564b]">
                progress_activity
              </span>
              <span className="font-label-md text-[#76777b]">Loading user details...</span>
            </div>
          )}

          {error && (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-[#ffdad6] flex items-center justify-center">
                <span className="material-symbols-outlined text-[32px] text-[#ba1a1a]">error</span>
              </div>
              <p className="font-label-md text-[#ba1a1a] max-w-sm">{error}</p>
            </div>
          )}

          {!loading && !error && userDetail && (
            <div className="bg-white border border-graphite-border p-8 relative">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E4554A]"></div>
              <AdminUserForm
                initialValues={{
                  fullName: userDetail.fullName,
                  email: userDetail.email,
                  avatarUrl: userDetail.avatarUrl || '',
                }}
                isEditMode={true}
                onSubmit={handleFormSubmit}
                onCancel={() => router.push(`/admin/users/${id}`)}
                submitButtonText="Save Changes"
                loadingText="Saving..."
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
