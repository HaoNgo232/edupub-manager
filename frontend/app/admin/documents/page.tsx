'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  listDocuments,
  DocumentResponse,
  DocumentListResponse,
  DocumentStatus,
  Subject,
  ApiError,
} from '../../../lib/api';
import { useAuth } from '../../context/AuthContext';
import SideNav from '../../../components/SideNav';
import StatusBadge from '../../../components/StatusBadge';
import {
  SUBJECT_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
  SUBJECT_ICONS,
} from '../../lib/constants/documents.constants';

export default function AdminDocumentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<DocumentListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState<Subject | ''>('');
  const [status, setStatus] = useState<DocumentStatus | ''>('');
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  // Guard: only ADMIN
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/documents');
    }
  }, [user, authLoading, router]);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listDocuments({
        q: search || undefined,
        subject: subject || undefined,
        status: status || undefined,
        page,
        limit: LIMIT,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      });
      setData(res);
    } catch (err) {
      if (err instanceof ApiError) setError(err.errors.join(', '));
      else setError('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  }, [search, subject, status, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!authLoading && user?.role === 'ADMIN') fetchDocs();
  }, [fetchDocs, authLoading, user]);

  const handleReset = () => {
    setSearch('');
    setSubject('');
    setStatus('');
    setPage(1);
  };

  if (authLoading || !user) {
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
        {/* Top header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-4 bg-[#faf9f5] border-b border-graphite-border">
          <div className="flex items-center gap-2 font-label-md text-[#76777b] pl-12 md:pl-0">
            <span className="material-symbols-outlined text-[18px] text-[#E4554A]">
              admin_panel_settings
            </span>
            <span className="text-[#030509] font-semibold truncate max-w-[150px] sm:max-w-none">
              Admin — All Documents
            </span>
          </div>
          <Link
            href="/documents/new"
            className="flex items-center gap-1.5 bg-[#E4554A] text-white font-label-md px-3 py-2 sm:px-4 rounded-sm hover:brightness-95 transition-all active:scale-[0.98]"
            title="New Document"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="hidden sm:inline">New Document</span>
          </Link>
        </header>

        <main className="flex-1 px-4 md:px-8 py-8 max-w-[1140px] w-full mx-auto space-y-6">
          {/* Page header */}
          <div>
            <h2 className="text-headline-lg text-[#030509]">All Documents</h2>
            <p className="font-label-md text-[#76777b] mt-1">
              Administrator view — see and manage all documents in the system.
            </p>
          </div>

          {/* Stats strip */}
          {data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: 'Total',
                  value: data.meta.total,
                  icon: 'description',
                  color: 'text-[#030509]',
                },
                {
                  label: 'Showing',
                  value: data.items.length,
                  icon: 'view_list',
                  color: 'text-[#030509]',
                },
                {
                  label: 'Page',
                  value: `${data.meta.page} / ${data.meta.totalPages}`,
                  icon: 'book',
                  color: 'text-[#030509]',
                },
                {
                  label: 'Per page',
                  value: data.meta.limit,
                  icon: 'format_list_numbered',
                  color: 'text-[#030509]',
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-[#f5f5f0] border border-graphite-border px-5 py-4 flex items-center gap-3"
                >
                  <span className="material-symbols-outlined text-[24px] text-[#76777b]">
                    {s.icon}
                  </span>
                  <div>
                    <p className={`font-label-md font-bold ${s.color}`}>{s.value}</p>
                    <p className="font-label-sm text-[#76777b] uppercase tracking-widest">
                      {s.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="bg-[#f5f5f0] border border-graphite-border p-5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPage(1);
                fetchDocs();
              }}
              className="flex flex-col lg:flex-row lg:items-end gap-4"
            >
              <div className="flex flex-col gap-1.5 w-full lg:max-w-[550px] lg:flex-grow">
                <label className="font-label-sm text-[#76777b] uppercase tracking-widest">
                  Search
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#76777b]">
                    search
                  </span>
                  <input
                    id="admin-filter-search"
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by title or description..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-graphite-border font-label-md focus:border-[#030509] outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 w-full lg:w-[220px]">
                <label className="font-label-sm text-[#76777b] uppercase tracking-widest">
                  Subject
                </label>
                <select
                  id="admin-filter-subject"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value as Subject | '');
                    setPage(1);
                  }}
                  className="bg-white border border-graphite-border py-2 px-3 font-label-md focus:border-[#030509] outline-none w-full"
                >
                  {SUBJECT_FILTER_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 w-full lg:w-[200px]">
                <label className="font-label-sm text-[#76777b] uppercase tracking-widest">
                  Status
                </label>
                <select
                  id="admin-filter-status"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as DocumentStatus | '');
                    setPage(1);
                  }}
                  className="bg-white border border-graphite-border py-2 px-3 font-label-md focus:border-[#030509] outline-none w-full"
                >
                  {STATUS_FILTER_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 w-full lg:w-auto mt-2 lg:mt-0">
                <button
                  type="submit"
                  className="flex-1 lg:flex-none px-5 py-2 bg-[#030509] text-white font-label-md hover:opacity-90 transition-all text-center justify-center flex items-center"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 lg:flex-none px-5 py-2 border border-graphite-border bg-white font-label-md text-[#76777b] hover:bg-[#e9e8e4] transition-all text-center justify-center flex items-center"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Table */}
          <div className="bg-white border border-graphite-border overflow-hidden">
            {error && (
              <div className="p-6 text-center text-[#ba1a1a] font-label-md">
                <span className="material-symbols-outlined block text-[32px] mb-2">error</span>
                {error}
              </div>
            )}

            {loading && !error && (
              <div className="p-12 flex flex-col items-center gap-3">
                <span className="material-symbols-outlined animate-spin text-[32px] text-[#e5564b]">
                  progress_activity
                </span>
                <span className="font-label-md text-[#76777b]">Loading all documents...</span>
              </div>
            )}

            {!loading && !error && data?.items.length === 0 && (
              <div className="py-16 text-center">
                <span className="material-symbols-outlined block text-[40px] text-[#c7c6cb] mb-3">
                  search_off
                </span>
                <p className="font-label-md text-[#76777b]">No documents match your filters.</p>
              </div>
            )}

            {!loading && !error && data && data.items.length > 0 && (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse" id="admin-documents-table">
                    <thead>
                      <tr className="border-b border-graphite-border bg-[#f4f4f0]">
                        {['Title', 'Owner', 'Subject', 'Grade', 'Status', 'Updated', 'Actions'].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-6 py-4 font-label-sm text-[#76777b] uppercase tracking-widest whitespace-nowrap"
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-graphite-border">
                      {data.items.map((doc) => (
                        <AdminDocumentRow key={doc.id} doc={doc} />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card List */}
                <div
                  className="md:hidden divide-y divide-graphite-border"
                  id="admin-documents-mobile-list"
                >
                  {data.items.map((doc) => (
                    <AdminDocumentCard key={doc.id} doc={doc} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-[#f4f4f0] border-t border-graphite-border flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="font-label-md text-[#76777b]">
                    Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, data.meta.total)} of{' '}
                    {data.meta.total} results
                  </span>
                  <AdminPagination meta={data.meta} page={page} onPageChange={setPage} />
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function AdminDocumentRow({ doc }: { doc: DocumentResponse }) {
  return (
    <tr className="group hover:bg-[#faf9f5] transition-colors">
      <td className="px-6 py-4 max-w-[220px]">
        <Link
          href={`/documents/${doc.id}`}
          className="font-label-md font-semibold text-[#030509] hover:text-[#E4554A] transition-colors line-clamp-2"
        >
          {doc.title}
        </Link>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#e9e8e4] border border-graphite-border flex items-center justify-center overflow-hidden shrink-0">
            {doc.owner.avatarUrl ? (
              <Image
                src={doc.owner.avatarUrl}
                alt=""
                width={28}
                height={28}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <span className="material-symbols-outlined text-[14px] text-[#76777b]">person</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-label-md text-[#030509] truncate">{doc.owner.fullName}</p>
            <p className="font-label-sm text-[#76777b] truncate">{doc.owner.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 font-label-md text-[#76777b] whitespace-nowrap">{doc.subject}</td>
      <td className="px-6 py-4 font-label-md text-[#76777b] whitespace-nowrap">
        Grade {doc.gradeLevel}
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={doc.status} />
      </td>
      <td className="px-6 py-4 font-label-md text-[#76777b] whitespace-nowrap">
        {new Date(doc.updatedAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/documents/${doc.id}`}
            title="View"
            className="p-1.5 text-[#76777b] hover:text-[#030509] hover:bg-[#e9e8e4] rounded transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
          </Link>
          <Link
            href={`/documents/${doc.id}/edit`}
            title="Edit"
            className="p-1.5 text-[#76777b] hover:text-[#030509] hover:bg-[#e9e8e4] rounded transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </Link>
        </div>
      </td>
    </tr>
  );
}

function AdminDocumentCard({ doc }: { doc: DocumentResponse }) {
  return (
    <div className="p-5 hover:bg-[#faf9f5] transition-colors flex flex-col gap-4">
      {/* Title */}
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-[22px] text-[#76777b] mt-0.5 shrink-0">
          {SUBJECT_ICONS[doc.subject] ?? 'article'}
        </span>
        <div className="flex-grow min-w-0">
          <Link
            href={`/documents/${doc.id}`}
            className="font-label-md font-semibold text-[#030509] hover:text-[#E4554A] transition-colors break-words text-[15px]"
          >
            {doc.title}
          </Link>
        </div>
      </div>

      {/* Owner info */}
      <div className="flex items-center gap-2.5 py-2 px-3 bg-[#f5f5f0] border border-graphite-border rounded-sm">
        <div className="w-8 h-8 rounded-full bg-[#e9e8e4] border border-graphite-border flex items-center justify-center overflow-hidden shrink-0">
          {doc.owner.avatarUrl ? (
            <Image
              src={doc.owner.avatarUrl}
              alt=""
              width={32}
              height={32}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <span className="material-symbols-outlined text-[16px] text-[#76777b]">person</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-label-md font-semibold text-[#030509] truncate text-xs">
            {doc.owner.fullName}
          </p>
          <p className="font-label-sm text-[#76777b] truncate text-[11px]">{doc.owner.email}</p>
        </div>
      </div>

      {/* Attributes & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#76777b] font-label-md">
          <span>{doc.subject}</span>
          <span className="text-[#d1d5db]">•</span>
          <span>Grade {doc.gradeLevel}</span>
          <span className="text-[#d1d5db]">•</span>
          <span>
            {new Date(doc.updatedAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
        <StatusBadge status={doc.status} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-2 pt-3 border-t border-[#f5f5f0]">
        <Link
          href={`/documents/${doc.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-graphite-border bg-white text-[#76777b] hover:text-[#030509] hover:bg-[#e9e8e4] rounded font-label-md transition-all active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">visibility</span>
          <span>View</span>
        </Link>
        <Link
          href={`/documents/${doc.id}/edit`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-graphite-border bg-white text-[#76777b] hover:text-[#030509] hover:bg-[#e9e8e4] rounded font-label-md transition-all active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
          <span>Edit</span>
        </Link>
      </div>
    </div>
  );
}

function AdminPagination({
  meta,
  page,
  onPageChange,
}: {
  meta: DocumentListResponse['meta'];
  page: number;
  onPageChange: (p: number) => void;
}) {
  const pages = Array.from({ length: meta.totalPages }, (_, i) => i + 1).slice(
    Math.max(0, page - 3),
    page + 2,
  );
  return (
    <div className="flex items-center gap-1">
      <PBtn
        disabled={!meta.hasPreviousPage}
        onClick={() => onPageChange(page - 1)}
        icon="chevron_left"
      />
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 flex items-center justify-center font-label-md transition-all ${
            p === page
              ? 'bg-[#460002] text-white'
              : 'border border-graphite-border bg-white text-[#76777b] hover:bg-[#f4f4f0]'
          }`}
        >
          {p}
        </button>
      ))}
      <PBtn
        disabled={!meta.hasNextPage}
        onClick={() => onPageChange(page + 1)}
        icon="chevron_right"
      />
    </div>
  );
}

function PBtn({
  onClick,
  disabled,
  icon,
}: {
  onClick: () => void;
  disabled: boolean;
  icon: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-9 h-9 flex items-center justify-center border border-graphite-border bg-white text-[#76777b] hover:bg-[#f4f4f0] disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
    </button>
  );
}
