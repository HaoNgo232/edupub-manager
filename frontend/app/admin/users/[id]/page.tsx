'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getAdminUserById, AdminUserDetail, ApiError, DocumentStatus } from '../../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import SideNav from '../../../../components/SideNav';
import RoleBadge from '../../../../components/admin/users/RoleBadge';
import StatusBadge from '../../../../components/StatusBadge';
import ChangeUserRoleDialog from '../../../../components/admin/users/ChangeUserRoleDialog';
import DeleteUserDialog from '../../../../components/admin/users/DeleteUserDialog';
import { resolveUploadUrl } from '../../../../lib/uploads/url';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [userDetail, setUserDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog controls
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Role guard
  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== 'ADMIN')) {
      router.push('/documents');
    }
  }, [currentUser, authLoading, router]);

  const fetchUserDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminUserById(id);
      setUserDetail(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to load user details.';
      if (err instanceof ApiError && err.statusCode === 404) {
        setError('User not found.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!authLoading && currentUser?.role === 'ADMIN') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchUserDetail();
    }
  }, [fetchUserDetail, authLoading, currentUser]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (authLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f5]">
        <span className="material-symbols-outlined animate-spin text-[32px] text-[#e5564b]">progress_activity</span>
      </div>
    );
  }

  const isSelf = currentUser.id === id;

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

        {/* Change Role Dialog */}
        {showRoleDialog && userDetail && (
          <ChangeUserRoleDialog
            userId={userDetail.id}
            userFullName={userDetail.fullName}
            userEmail={userDetail.email}
            currentRole={userDetail.role}
            onSuccess={() => {
              setShowRoleDialog(false);
              fetchUserDetail();
              showToast('User role updated successfully.');
            }}
            onCancel={() => setShowRoleDialog(false)}
          />
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && userDetail && (
          <DeleteUserDialog
            userId={userDetail.id}
            userFullName={userDetail.fullName}
            onSuccess={() => {
              setShowDeleteDialog(false);
              showToast('User deleted successfully.');
              setTimeout(() => router.push('/admin/users'), 1000);
            }}
            onCancel={() => setShowDeleteDialog(false)}
          />
        )}

        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-4 bg-[#faf9f5] border-b border-graphite-border">
          <div className="flex items-center gap-2 font-label-md text-[#76777b] pl-12 md:pl-0">
            <span className="material-symbols-outlined text-[18px] text-[#E4554A]">admin_panel_settings</span>
            <span className="text-[#030509] font-semibold">Admin — User Details</span>
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
        <main className="flex-1 px-4 md:px-8 py-8 max-w-[1140px] w-full mx-auto space-y-6">
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
              <p className="font-label-md text-[#ba1a1a] max-w-sm" id="user-detail-error">
                {error}
              </p>
              <Link
                href="/admin/users"
                className="font-label-md text-[#E4554A] hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Back to Users
              </Link>
            </div>
          )}

          {!loading && !error && userDetail && (
            <div className="space-y-6">
              {/* Header section with back nav */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-headline-lg text-[#030509]" id="user-detail-name">
                    {userDetail.fullName}
                  </h2>
                  <p className="font-label-md text-[#76777b] mt-1" id="user-detail-email">
                    {userDetail.email}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <Link
                    href={`/admin/users/${userDetail.id}/edit`}
                    id="btn-edit-user"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#E4554A] text-white font-label-md px-5 py-2.5 rounded-none hover:brightness-95 transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Edit User
                  </Link>
                  <button
                    id="btn-change-role"
                    onClick={() => setShowRoleDialog(true)}
                    disabled={isSelf}
                    title={isSelf ? 'You cannot change your own role.' : 'Change User Role'}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 border border-graphite-border bg-white text-[#030509] font-label-md px-5 py-2.5 rounded-none hover:bg-[#e9e8e4] disabled:opacity-40 disabled:hover:bg-white transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                    Change Role
                  </button>
                  <button
                    id="btn-delete-user"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isSelf}
                    title={isSelf ? 'You cannot delete your own account.' : 'Delete User'}
                    className="flex-grow sm:flex-none flex items-center justify-center gap-2 border border-[#ba1a1a] text-[#ba1a1a] bg-white font-label-md px-5 py-2.5 rounded-none hover:bg-[#ffdad6] disabled:opacity-40 disabled:hover:bg-white transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    Delete User
                  </button>
                </div>
              </div>

              {/* Warnings for self action protection */}
              {isSelf && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    id="self-action-role-warning"
                    className="p-3 bg-[#fff3cd] border border-[#ffe69c] text-[#664d03] font-label-md rounded flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                    <span>You cannot change your own role.</span>
                  </div>
                  <div
                    id="self-action-delete-warning"
                    className="p-3 bg-[#fff3cd] border border-[#ffe69c] text-[#664d03] font-label-md rounded flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                    <span>You cannot delete your own account.</span>
                  </div>
                </div>
              )}

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Basic info panel */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Profile Card */}
                  <div className="bg-[#f5f5f0] border border-graphite-border p-6 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#460002]" />
                    <div className="flex flex-col items-center text-center space-y-4 mb-6">
                      <div className="w-24 h-24 rounded-full bg-white border border-graphite-border flex items-center justify-center overflow-hidden">
                        {userDetail.avatarUrl ? (
                          <Image
                            src={resolveUploadUrl(userDetail.avatarUrl)}
                            alt=""
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="material-symbols-outlined text-[48px] text-[#76777b]">person</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-label-md font-bold text-[#030509] text-[18px]">{userDetail.fullName}</h3>
                        <p className="font-label-sm text-[#76777b]">{userDetail.email}</p>
                      </div>
                      <div id="user-detail-role">
                        <RoleBadge role={userDetail.role} />
                      </div>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-graphite-border">
                      <div className="flex justify-between items-center py-1.5 border-b border-dashed border-graphite-border last:border-0">
                        <span className="font-label-md text-[#76777b]">Created At</span>
                        <span className="font-label-md font-semibold text-[#030509]">
                          {formatDate(userDetail.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-dashed border-graphite-border last:border-0">
                        <span className="font-label-md text-[#76777b]">Updated At</span>
                        <span className="font-label-md font-semibold text-[#030509]">
                          {formatDate(userDetail.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Documents Count Card */}
                  <div
                    id="user-detail-documents"
                    className="bg-[#f5f5f0] border border-graphite-border p-6 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-white border border-graphite-border flex items-center justify-center text-[#76777b]">
                      <span className="material-symbols-outlined text-[24px]">description</span>
                    </div>
                    <div>
                      <p className="text-headline-md font-bold text-[#030509]">{userDetail.documentsCount}</p>
                      <p className="font-label-sm text-[#76777b] uppercase tracking-widest">Total Documents</p>
                    </div>
                  </div>
                </div>

                {/* Recent Documents panel */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="bg-white border border-graphite-border p-6">
                    <h3 className="font-label-sm text-[#76777b] uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">history</span>
                      Recent Documents
                    </h3>

                    {userDetail.recentDocuments && userDetail.recentDocuments.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-graphite-border bg-[#f4f4f0]">
                              {['Title', 'Subject', 'Grade', 'Status', 'Updated At'].map((h) => (
                                <th
                                  key={h}
                                  className="px-4 py-3 font-label-sm text-[#76777b] uppercase tracking-widest whitespace-nowrap text-xs"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-graphite-border">
                            {userDetail.recentDocuments.map((doc) => (
                              <tr key={doc.id} className="hover:bg-[#faf9f5] transition-colors">
                                <td className="px-4 py-3 max-w-[200px]">
                                  <Link
                                    href={`/documents/${doc.id}`}
                                    className="font-label-md font-semibold text-[#030509] hover:text-[#E4554A] transition-colors line-clamp-1"
                                  >
                                    {doc.title}
                                  </Link>
                                </td>
                                <td className="px-4 py-3 font-label-md text-[#76777b] text-xs whitespace-nowrap">
                                  {doc.subject}
                                </td>
                                <td className="px-4 py-3 font-label-md text-[#76777b] text-xs whitespace-nowrap">
                                  Grade {doc.gradeLevel}
                                </td>
                                <td className="px-4 py-3">
                                  <StatusBadge status={doc.status as DocumentStatus} />
                                </td>
                                <td className="px-4 py-3 font-label-md text-[#76777b] text-xs whitespace-nowrap">
                                  {formatDate(doc.updatedAt)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-12 text-center text-[#76777b] font-label-md">
                        No recent documents found for this user.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
