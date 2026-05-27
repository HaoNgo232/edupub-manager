'use client';

import React, { useEffect, useState, useCallback, Suspense, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { getAdminUsers, AdminUserListItem, PaginatedAdminUsersResponse, Role, ApiError } from '../../../lib/api';
import { useAuth } from '../../context/AuthContext';
import SideNav from '../../../components/SideNav';
import RoleBadge from '../../../components/admin/users/RoleBadge';
import ChangeUserRoleDialog from '../../../components/admin/users/ChangeUserRoleDialog';
import DeleteUserDialog from '../../../components/admin/users/DeleteUserDialog';

function AdminUsersListContent() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Dialog states
  const [roleChangeUser, setRoleChangeUser] = useState<AdminUserListItem | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUserListItem | null>(null);

  // Success toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data states
  const [data, setData] = useState<PaginatedAdminUsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derived URL parameters (single source of truth for loading data)
  const qParam = searchParams.get('q') || '';
  const roleParam = (searchParams.get('role') as Role) || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const limitParam = parseInt(searchParams.get('limit') || '10', 10);
  const sortByParam =
    (searchParams.get('sortBy') as 'createdAt' | 'updatedAt' | 'email' | 'fullName' | 'role') || 'createdAt';
  const sortOrderParam = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

  // Local state for search input and role filter
  const [searchVal, setSearchVal] = useState(qParam);
  const [roleVal, setRoleVal] = useState<Role | ''>(roleParam);

  const lastSyncedQuery = useRef(qParam);

  // Sync URL parameters back to local state (for back/forward browser navigation)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchVal(qParam);

    setRoleVal(roleParam);
    lastSyncedQuery.current = qParam;
  }, [qParam, roleParam]);

  // Role guard
  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== 'ADMIN')) {
      router.push('/documents');
    }
  }, [currentUser, authLoading, router]);

  // URL parameters update helper
  const updateUrl = useCallback(
    (newParams: Record<string, string | number | undefined | null>) => {
      const params = new URLSearchParams();

      // Construct next parameters using local state as baseline for input elements,
      // and current searchParams for page/sorting, merged with newParams overrides.
      const q = newParams.q !== undefined ? newParams.q : searchVal;
      const role = newParams.role !== undefined ? newParams.role : roleVal;
      const page = newParams.page !== undefined ? newParams.page : searchParams.get('page') || '1';
      const limit = newParams.limit !== undefined ? newParams.limit : searchParams.get('limit') || '10';
      const sortBy = newParams.sortBy !== undefined ? newParams.sortBy : searchParams.get('sortBy') || 'createdAt';
      const sortOrder =
        newParams.sortOrder !== undefined ? newParams.sortOrder : searchParams.get('sortOrder') || 'desc';

      if (q !== undefined && q !== null && q !== '') {
        params.set('q', q.toString());
      }
      if (role !== undefined && role !== null && role !== '') {
        params.set('role', role.toString());
      }
      if (page !== undefined && page !== null && page !== '' && page.toString() !== '1') {
        params.set('page', page.toString());
      }
      if (limit !== undefined && limit !== null && limit !== '' && limit.toString() !== '10') {
        params.set('limit', limit.toString());
      }
      if (sortBy !== undefined && sortBy !== null && sortBy !== '' && sortBy.toString() !== 'createdAt') {
        params.set('sortBy', sortBy.toString());
      }
      if (sortOrder !== undefined && sortOrder !== null && sortOrder !== '' && sortOrder.toString() !== 'desc') {
        params.set('sortOrder', sortOrder.toString());
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router, searchVal, roleVal],
  );

  // Debounced search logic (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchVal !== lastSyncedQuery.current) {
        lastSyncedQuery.current = searchVal;
        updateUrl({ q: searchVal, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchVal, updateUrl]);

  // Fetch users function
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminUsers({
        q: qParam || undefined,
        role: roleParam || undefined,
        page: pageParam,
        limit: limitParam,
        sortBy: sortByParam,
        sortOrder: sortOrderParam,
      });
      setData(res);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.errors.join(', '));
      } else {
        setError('Something went wrong while loading the user list.');
      }
    } finally {
      setLoading(false);
    }
  }, [qParam, roleParam, pageParam, limitParam, sortByParam, sortOrderParam]);

  // Trigger fetch when parameters change
  useEffect(() => {
    if (!authLoading && currentUser?.role === 'ADMIN') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchUsers();
    }
  }, [fetchUsers, authLoading, currentUser]);

  const handleApplyFilters = () => {
    lastSyncedQuery.current = searchVal;
    updateUrl({ q: searchVal, page: 1 });
  };

  const handleResetFilters = () => {
    setSearchVal('');
    setRoleVal('');
    lastSyncedQuery.current = '';
    updateUrl({
      q: '',
      role: '',
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const handlePageChange = (newPage: number) => {
    updateUrl({ page: newPage });
  };

  const handleLimitChange = (newLimit: number) => {
    updateUrl({ limit: newLimit, page: 1 });
  };

  const handleRoleFilterChange = (newRole: string) => {
    setRoleVal(newRole as Role | '');
    updateUrl({ role: newRole, page: 1 });
  };

  const handleSortChange = (sortOption: string) => {
    let sortBy = 'createdAt';
    let sortOrder = 'desc';

    switch (sortOption) {
      case 'oldest':
        sortBy = 'createdAt';
        sortOrder = 'asc';
        break;
      case 'name-asc':
        sortBy = 'fullName';
        sortOrder = 'asc';
        break;
      case 'name-desc':
        sortBy = 'fullName';
        sortOrder = 'desc';
        break;
      case 'email-asc':
        sortBy = 'email';
        sortOrder = 'asc';
        break;
      case 'email-desc':
        sortBy = 'email';
        sortOrder = 'desc';
        break;
    }

    updateUrl({ sortBy, sortOrder, page: 1 });
  };

  // Convert sort params back to option value
  const getSortOptionValue = () => {
    if (sortByParam === 'createdAt' && sortOrderParam === 'asc') return 'oldest';
    if (sortByParam === 'fullName' && sortOrderParam === 'asc') return 'name-asc';
    if (sortByParam === 'fullName' && sortOrderParam === 'desc') return 'name-desc';
    if (sortByParam === 'email' && sortOrderParam === 'asc') return 'email-asc';
    if (sortByParam === 'email' && sortOrderParam === 'desc') return 'email-desc';
    return 'newest';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (authLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f5]">
        <span className="material-symbols-outlined animate-spin text-[32px] text-[#e5564b]">progress_activity</span>
      </div>
    );
  }

  const isCurrentAdmin = (id: string) => currentUser.id === id;

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      <SideNav />

      {/* Main content drawer */}
      <div className="md:ml-64 flex-1 flex flex-col min-h-screen overflow-x-hidden relative">
        {/* Toast notification */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-[#030509] text-white font-label-md px-5 py-3 shadow-lg border border-graphite-border flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-emerald-500">check_circle</span>
            {toastMessage}
          </div>
        )}

        {/* Change Role Dialog */}
        {roleChangeUser && (
          <ChangeUserRoleDialog
            userId={roleChangeUser.id}
            userFullName={roleChangeUser.fullName}
            userEmail={roleChangeUser.email}
            currentRole={roleChangeUser.role}
            onSuccess={() => {
              setRoleChangeUser(null);
              fetchUsers();
              showToast('User role updated successfully.');
            }}
            onCancel={() => setRoleChangeUser(null)}
          />
        )}

        {/* Delete Confirmation Dialog */}
        {deleteUser && (
          <DeleteUserDialog
            userId={deleteUser.id}
            userFullName={deleteUser.fullName}
            onSuccess={() => {
              setDeleteUser(null);
              fetchUsers();
              showToast('User deleted successfully.');
            }}
            onCancel={() => setDeleteUser(null)}
          />
        )}

        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-4 bg-[#faf9f5] border-b border-graphite-border">
          <div className="flex items-center gap-2 font-label-md text-[#76777b] pl-12 md:pl-0">
            <span className="material-symbols-outlined text-[18px] text-[#E4554A]">admin_panel_settings</span>
            <span className="text-[#030509] font-semibold">Admin — User Management</span>
          </div>
          <Link
            href="/admin/users/new"
            className="flex items-center gap-1.5 bg-[#E4554A] text-white font-label-md px-3 py-2 sm:px-4 rounded-sm hover:brightness-95 transition-all active:scale-[0.98]"
            title="Create User"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Create User</span>
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 md:px-8 py-8 max-w-[1140px] w-full mx-auto space-y-6">
          <div>
            <h2 className="text-headline-lg text-[#030509]">Users</h2>
            <p className="font-label-md text-[#76777b] mt-1">Manage user accounts, roles, and access permissions.</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-[#f5f5f0] border border-graphite-border p-5">
            <div className="flex flex-col lg:flex-row lg:items-end gap-4">
              {/* Search */}
              <div className="flex flex-col gap-1.5 w-full lg:max-w-[550px] lg:flex-grow">
                <label className="font-label-sm text-[#76777b] uppercase tracking-widest" htmlFor="filter-search">
                  Search
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#76777b]">
                    search
                  </span>
                  <input
                    id="filter-search"
                    type="text"
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-graphite-border font-label-md focus:border-[#030509] outline-none"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div className="flex flex-col gap-1.5 w-full lg:w-[200px]">
                <label className="font-label-sm text-[#76777b] uppercase tracking-widest" htmlFor="filter-role">
                  Role
                </label>
                <select
                  id="filter-role"
                  value={roleVal}
                  onChange={(e) => handleRoleFilterChange(e.target.value)}
                  className="bg-white border border-graphite-border py-2 px-3 font-label-md focus:border-[#030509] outline-none w-full"
                >
                  <option value="">All roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="USER">User</option>
                </select>
              </div>

              {/* Sort Order */}
              <div className="flex flex-col gap-1.5 w-full lg:w-[220px]">
                <label className="font-label-sm text-[#76777b] uppercase tracking-widest" htmlFor="filter-sort">
                  Sort By
                </label>
                <select
                  id="filter-sort"
                  value={getSortOptionValue()}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-white border border-graphite-border py-2 px-3 font-label-md focus:border-[#030509] outline-none w-full"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="email-asc">Email A-Z</option>
                  <option value="email-desc">Email Z-A</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 w-full lg:w-auto mt-2 lg:mt-0">
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="flex-1 lg:flex-none px-5 py-2 bg-[#030509] text-white font-label-md hover:opacity-90 transition-all text-center justify-center flex items-center"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex-1 lg:flex-none px-5 py-2 border border-graphite-border bg-white font-label-md text-[#76777b] hover:bg-[#e9e8e4] transition-all text-center justify-center flex items-center"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-graphite-border overflow-hidden">
            {error && (
              <div className="p-12 text-center text-[#ba1a1a] font-label-md">
                <span className="material-symbols-outlined block text-[32px] mb-2">error</span>
                <p className="font-bold text-[18px]">Unable to load users</p>
                <p className="text-sm mt-1">{error}</p>
                <button
                  onClick={fetchUsers}
                  className="mt-4 px-4 py-2 bg-[#E4554A] text-white font-label-md hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Retry
                </button>
              </div>
            )}

            {loading && !error && (
              <div className="p-12 space-y-4">
                <div className="h-10 bg-[#faf9f5] animate-pulse w-full"></div>
                <div className="h-16 bg-[#f5f5f0] animate-pulse w-full"></div>
                <div className="h-16 bg-[#faf9f5] animate-pulse w-full"></div>
                <div className="h-16 bg-[#f5f5f0] animate-pulse w-full"></div>
              </div>
            )}

            {!loading && !error && data?.items.length === 0 && (
              <div className="py-20 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-[#f4f4f0] border border-graphite-border flex items-center justify-center">
                  <span className="material-symbols-outlined text-[32px] text-[#76777b]">search_off</span>
                </div>
                <div>
                  <p className="font-label-md font-semibold text-[#030509] mb-1">No users found</p>
                  <p className="font-label-md text-[#76777b]">There are no users matching your current filters.</p>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 border border-graphite-border bg-white text-[#76777b] hover:bg-[#e9e8e4] font-label-md transition-all rounded-sm"
                  >
                    Clear Filters
                  </button>
                  <Link
                    href="/admin/users/new"
                    className="px-4 py-2 bg-[#E4554A] text-white hover:opacity-90 font-label-md transition-all rounded-sm"
                  >
                    Create User
                  </Link>
                </div>
              </div>
            )}

            {!loading && !error && data && data.items.length > 0 && (
              <>
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse" id="admin-users-table">
                    <thead>
                      <tr className="border-b border-graphite-border bg-[#f4f4f0]">
                        {['User', 'Role', 'Documents', 'Created At', 'Updated At', 'Actions'].map((h) => (
                          <th
                            key={h}
                            className="px-6 py-4 font-label-sm text-[#76777b] uppercase tracking-widest whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-graphite-border">
                      {data.items.map((item) => (
                        <tr key={item.id} className="group hover:bg-[#faf9f5] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#e9e8e4] border border-graphite-border flex items-center justify-center overflow-hidden shrink-0">
                                {item.avatarUrl ? (
                                  <Image
                                    src={item.avatarUrl}
                                    alt=""
                                    width={36}
                                    height={36}
                                    className="w-full h-full object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <span className="material-symbols-outlined text-[18px] text-[#76777b]">person</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-label-md font-semibold text-[#030509] truncate">{item.fullName}</p>
                                <p className="font-label-sm text-[#76777b] truncate">{item.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <RoleBadge role={item.role} />
                          </td>
                          <td className="px-6 py-4 font-label-md text-[#76777b] whitespace-nowrap">
                            {item.documentsCount}
                          </td>
                          <td className="px-6 py-4 font-label-md text-[#76777b] whitespace-nowrap">
                            {formatDate(item.createdAt)}
                          </td>
                          <td className="px-6 py-4 font-label-md text-[#76777b] whitespace-nowrap">
                            {formatDate(item.updatedAt)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              <Link
                                href={`/admin/users/${item.id}`}
                                title="View"
                                className="w-8 h-8 flex items-center justify-center text-[#76777b] hover:text-[#030509] hover:bg-[#e9e8e4] rounded transition-all"
                              >
                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                              </Link>
                              <Link
                                href={`/admin/users/${item.id}/edit`}
                                title="Edit"
                                className="w-8 h-8 flex items-center justify-center text-[#76777b] hover:text-[#030509] hover:bg-[#e9e8e4] rounded transition-all"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </Link>
                              <button
                                onClick={() => setRoleChangeUser(item)}
                                disabled={isCurrentAdmin(item.id)}
                                title={isCurrentAdmin(item.id) ? 'Cannot change your own role' : 'Change Role'}
                                className="w-8 h-8 flex items-center justify-center text-[#76777b] hover:text-[#030509] hover:bg-[#e9e8e4] rounded disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                              >
                                <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                              </button>
                              <button
                                onClick={() => setDeleteUser(item)}
                                disabled={isCurrentAdmin(item.id)}
                                title={isCurrentAdmin(item.id) ? 'Cannot delete your own account' : 'Delete User'}
                                className="w-8 h-8 flex items-center justify-center text-[#ba1a1a] hover:bg-[#ffdad6] rounded disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden divide-y divide-graphite-border">
                  {data.items.map((item) => (
                    <div key={item.id} className="p-5 hover:bg-[#faf9f5] transition-colors flex flex-col gap-4">
                      {/* User basic info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#e9e8e4] border border-graphite-border flex items-center justify-center overflow-hidden shrink-0">
                          {item.avatarUrl ? (
                            <Image
                              src={item.avatarUrl}
                              alt=""
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <span className="material-symbols-outlined text-[20px] text-[#76777b]">person</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-label-md font-semibold text-[#030509] truncate">{item.fullName}</p>
                          <p className="font-label-sm text-[#76777b] truncate">{item.email}</p>
                        </div>
                      </div>

                      {/* Details row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#76777b] font-label-md">
                          <RoleBadge role={item.role} />
                          <span className="text-[#d1d5db]">•</span>
                          <span>{item.documentsCount} docs</span>
                          <span className="text-[#d1d5db]">•</span>
                          <span>Created {formatDate(item.createdAt)}</span>
                        </div>
                      </div>

                      {/* Actions strip */}
                      <div className="flex items-center gap-2 mt-2 pt-3 border-t border-[#f5f5f0]">
                        <Link
                          href={`/admin/users/${item.id}`}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-graphite-border bg-white text-[#76777b] hover:text-[#030509] hover:bg-[#e9e8e4] rounded font-label-md transition-all text-xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          <span>View</span>
                        </Link>
                        <Link
                          href={`/admin/users/${item.id}/edit`}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-graphite-border bg-white text-[#76777b] hover:text-[#030509] hover:bg-[#e9e8e4] rounded font-label-md transition-all text-xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                          <span>Edit</span>
                        </Link>
                        <button
                          onClick={() => setRoleChangeUser(item)}
                          disabled={isCurrentAdmin(item.id)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-graphite-border bg-white text-[#5d636f] disabled:opacity-40 rounded font-label-md transition-all text-xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
                          <span>Role</span>
                        </button>
                        <button
                          onClick={() => setDeleteUser(item)}
                          disabled={isCurrentAdmin(item.id)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-[#ba1a1a] bg-white text-[#ba1a1a] disabled:opacity-40 rounded font-label-md transition-all text-xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination footer */}
                <div className="px-6 py-4 bg-[#f4f4f0] border-t border-graphite-border flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="font-label-md text-[#76777b]">
                    Showing {(pageParam - 1) * limitParam + 1}–{Math.min(pageParam * limitParam, data.meta.total)} of{' '}
                    {data.meta.total} results
                  </span>

                  <div className="flex items-center gap-4">
                    {/* Limit Select */}
                    <div className="flex items-center gap-1.5">
                      <span className="font-label-sm text-[#76777b]">Show:</span>
                      <select
                        value={limitParam}
                        onChange={(e) => handleLimitChange(parseInt(e.target.value, 10))}
                        className="bg-white border border-graphite-border py-1 px-2 font-label-md outline-none text-xs"
                      >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                      </select>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePageChange(pageParam - 1)}
                        disabled={!data.meta.hasPreviousPage}
                        className="w-9 h-9 flex items-center justify-center border border-graphite-border bg-white text-[#76777b] hover:bg-[#f4f4f0] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                      </button>
                      <span className="font-label-md text-[#030509] px-2">
                        {data.meta.page} / {data.meta.totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(pageParam + 1)}
                        disabled={!data.meta.hasNextPage}
                        className="w-9 h-9 flex items-center justify-center border border-graphite-border bg-white text-[#76777b] hover:bg-[#f4f4f0] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#faf9f5]">
          <span className="material-symbols-outlined animate-spin text-[32px] text-[#e5564b]">progress_activity</span>
        </div>
      }
    >
      <AdminUsersListContent />
    </Suspense>
  );
}
