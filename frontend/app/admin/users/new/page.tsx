'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAdminUser, Role } from '../../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import SideNav from '../../../../components/SideNav';
import AdminUserForm from '../../../../components/admin/users/AdminUserForm';

export default function CreateUserPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Role guard
  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== 'ADMIN')) {
      router.push('/documents');
    }
  }, [currentUser, authLoading, router]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFormSubmit = async (values: {
    email: string;
    password?: string;
    fullName: string;
    role?: Role;
    avatarUrl?: string;
  }) => {
    // Call API
    const result = await createAdminUser({
      email: values.email,
      password: values.password || '',
      fullName: values.fullName,
      role: values.role || 'USER',
      avatarUrl: values.avatarUrl,
    });

    showToast('User created successfully.');
    // Delay to let the toast show, then redirect
    setTimeout(() => {
      router.push(`/admin/users/${result.id}`);
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
            <span className="text-[#030509] font-semibold">Admin — Create User</span>
          </div>
          <button
            onClick={() => router.push('/admin/users')}
            className="flex items-center gap-1 font-label-md text-[#5d636f] hover:text-[#030509] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Users</span>
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 md:px-8 py-8 max-w-[650px] w-full mx-auto space-y-6">
          <div>
            <h2 className="text-headline-lg text-[#030509]">Create User</h2>
            <p className="font-label-md text-[#76777b] mt-1">Add a new user account to the system.</p>
          </div>

          <div className="bg-white border border-graphite-border p-8 relative">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E4554A]"></div>
            <AdminUserForm
              onSubmit={handleFormSubmit}
              onCancel={() => router.push('/admin/users')}
              submitButtonText="Create User"
              loadingText="Creating..."
            />
          </div>
        </main>
      </div>
    </div>
  );
}
