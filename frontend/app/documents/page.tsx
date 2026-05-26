'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  listDocuments,
  DocumentResponse,
  DocumentListResponse,
  DocumentStatus,
  Subject,
  ApiError,
} from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import {
  SUBJECT_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
  SUBJECT_ICONS,
} from '../lib/constants/documents.constants';

export default function MyDocumentsPage() {
  const [data, setData] = useState<DocumentListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState<Subject | ''>('');
  const [status, setStatus] = useState<DocumentStatus | ''>('');
  const [page, setPage] = useState(1);
  const LIMIT = 10;

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
    fetchDocs();
  }, [fetchDocs]);

  const handleReset = () => {
    setSearch('');
    setSubject('');
    setStatus('');
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDocs();
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-headline-lg text-[#030509]">My Documents</h2>
          <p className="font-label-md text-[#76777b] mt-1">
            Manage your educational documents and learning resources.
          </p>
        </div>
        <Link
          href="/documents/new"
          id="btn-create-document"
          className="flex items-center justify-center gap-2 bg-[#E4554A] text-white font-label-md px-5 py-2.5 rounded-sm hover:brightness-95 transition-all active:scale-[0.98] w-full sm:w-auto shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Create Document
        </Link>
      </div>

      {/* Filter bar */}
      <div className="bg-[#f5f5f0] border border-graphite-border p-5">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row lg:items-end gap-4">
          {/* Search */}
          <div className="flex flex-col gap-1.5 flex-grow w-full">
            <label className="font-label-sm text-[#76777b] uppercase tracking-widest">Search</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#76777b]">
                search
              </span>
              <input
                id="filter-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Title or description..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-graphite-border font-label-md focus:border-[#030509] focus:ring-0 outline-none transition-all"
              />
            </div>
          </div>

          {/* Subject */}
          <div className="flex flex-col gap-1.5 w-full lg:w-[220px]">
            <label className="font-label-sm text-[#76777b] uppercase tracking-widest">
              Subject
            </label>
            <select
              id="filter-subject"
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

          {/* Status */}
          <div className="flex flex-col gap-1.5 w-full lg:w-[200px]">
            <label className="font-label-sm text-[#76777b] uppercase tracking-widest">Status</label>
            <select
              id="filter-status"
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

          {/* Buttons */}
          <div className="flex gap-2 w-full lg:w-auto mt-2 lg:mt-0">
            <button
              type="submit"
              className="flex-1 lg:flex-none px-5 py-2 bg-[#030509] text-white font-label-md hover:opacity-90 transition-all active:scale-[0.98] text-center justify-center flex items-center"
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
            <span className="font-label-md text-[#76777b]">Loading documents...</span>
          </div>
        )}

        {!loading && !error && data?.items.length === 0 && (
          <EmptyState hasFilters={!!(search || subject || status)} onReset={handleReset} />
        )}

        {!loading && !error && data && data.items.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="documents-table">
                <thead>
                  <tr className="border-b border-graphite-border bg-[#f4f4f0]">
                    {['Title', 'Subject', 'Grade', 'Status', 'Updated', 'Actions'].map((h) => (
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
                  {data.items.map((doc) => (
                    <DocumentRow key={doc.id} doc={doc} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-[#f4f4f0] border-t border-graphite-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="font-label-md text-[#76777b]">
                Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, data.meta.total)} of{' '}
                {data.meta.total} results
              </span>
              <Pagination meta={data.meta} page={page} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function DocumentRow({ doc }: { doc: DocumentResponse }) {
  return (
    <tr className="group hover:bg-[#faf9f5] transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[20px] text-[#76777b]">
            {SUBJECT_ICONS[doc.subject] ?? 'article'}
          </span>
          <Link
            href={`/documents/${doc.id}`}
            className="font-label-md font-semibold text-[#030509] hover:text-[#E4554A] transition-colors line-clamp-1 max-w-xs"
          >
            {doc.title}
          </Link>
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

function Pagination({
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
      <PageBtn
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
      <PageBtn
        disabled={!meta.hasNextPage}
        onClick={() => onPageChange(page + 1)}
        icon="chevron_right"
      />
    </div>
  );
}

function PageBtn({
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
      className="w-9 h-9 flex items-center justify-center border border-graphite-border bg-white text-[#76777b] hover:bg-[#f4f4f0] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
    </button>
  );
}

function EmptyState({ hasFilters, onReset }: { hasFilters: boolean; onReset: () => void }) {
  return (
    <div className="py-20 flex flex-col items-center gap-4 text-center">
      <div className="w-16 h-16 rounded-full bg-[#f4f4f0] border border-graphite-border flex items-center justify-center">
        <span className="material-symbols-outlined text-[32px] text-[#76777b]">
          {hasFilters ? 'search_off' : 'description'}
        </span>
      </div>
      <div>
        <p className="font-label-md font-semibold text-[#030509] mb-1">
          {hasFilters ? 'No documents match your filters' : 'No documents yet'}
        </p>
        <p className="font-label-md text-[#76777b]">
          {hasFilters
            ? 'Try adjusting or resetting your filters.'
            : 'Create your first educational document to get started.'}
        </p>
      </div>
      {hasFilters ? (
        <button
          onClick={onReset}
          className="font-label-md text-[#E4554A] hover:underline transition-all"
        >
          Reset filters
        </button>
      ) : (
        <Link
          href="/documents/new"
          className="flex items-center gap-2 bg-[#E4554A] text-white font-label-md px-5 py-2.5 rounded-sm hover:brightness-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Create First Document
        </Link>
      )}
    </div>
  );
}
