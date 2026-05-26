'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getDocument, deleteDocument, DocumentResponse, ApiError } from '../../../lib/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../../components/StatusBadge';

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [doc, setDoc] = useState<DocumentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const d = await getDocument(id);
        setDoc(d);
      } catch (err) {
        if (err instanceof ApiError && err.statusCode === 404) {
          setError('Document not found or you do not have permission to view it.');
        } else {
          setError('Failed to load document.');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteDocument(id);
      router.push('/documents');
    } catch (err) {
      if (err instanceof ApiError) setError(err.errors.join(', '));
      else setError('Failed to delete document.');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <span className="material-symbols-outlined animate-spin text-[32px] text-[#e5564b]">
          progress_activity
        </span>
        <span className="font-label-md text-[#76777b]">Loading document...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#ffdad6] flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px] text-[#ba1a1a]">error</span>
        </div>
        <p className="font-label-md text-[#ba1a1a] max-w-sm">{error}</p>
        <Link
          href="/documents"
          className="font-label-md text-[#E4554A] hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Documents
        </Link>
      </div>
    );
  }

  if (!doc) return null;

  const isOwner = user?.id === doc.ownerId;
  const canEdit = isOwner || user?.role === 'ADMIN';

  return (
    <>
      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <DeleteModal
          title={doc.title}
          deleting={deleting}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      <div className="space-y-6">
        {/* Back nav */}
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 font-label-md text-[#76777b] hover:text-[#030509] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-0.5">
            arrow_back
          </span>
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ─── Main column ───────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header card */}
            <section className="bg-white border border-graphite-border p-8 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#460002]" />
              <div className="space-y-3 mb-6">
                <StatusBadge status={doc.status} size="md" />
                <h1 id="document-title" className="text-headline-xl text-[#030509] leading-tight">
                  {doc.title}
                </h1>
              </div>

              {doc.description && (
                <p className="font-body-lg text-[#76777b] leading-relaxed mb-6">
                  {doc.description}
                </p>
              )}

              {/* Actions */}
              {canEdit && (
                <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-graphite-border">
                  <Link
                    href={`/documents/${doc.id}/edit`}
                    id="btn-edit-document"
                    className="flex items-center gap-2 bg-[#460002] text-white font-label-md px-5 py-2.5 rounded-sm hover:opacity-90 transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Edit Document
                  </Link>
                  <button
                    id="btn-delete-document"
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 border border-[#ba1a1a] text-[#ba1a1a] bg-white font-label-md px-5 py-2.5 rounded-sm hover:bg-[#ffdad6] transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    Delete
                  </button>
                </div>
              )}
            </section>

            {/* Metadata grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MetaCard title="Document Info" icon="info">
                <MetaRow label="Subject" value={doc.subject} />
                <MetaRow label="Grade Level" value={`Grade ${doc.gradeLevel}`} />
                <MetaRow
                  label="Created"
                  value={new Date(doc.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                />
                <MetaRow
                  label="Updated"
                  value={new Date(doc.updatedAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                />
              </MetaCard>

              <MetaCard title="Owner" icon="person">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#e9e8e4] border border-graphite-border flex items-center justify-center overflow-hidden">
                    {doc.owner.avatarUrl ? (
                      <Image
                        src={doc.owner.avatarUrl}
                        alt={doc.owner.fullName}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="material-symbols-outlined text-[20px] text-[#76777b]">
                        account_circle
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-label-md font-semibold text-[#030509]">
                      {doc.owner.fullName}
                    </p>
                    <p className="font-label-sm text-[#76777b]">{doc.owner.email}</p>
                    <span className="font-label-sm bg-[#e9e8e4] text-[#46464b] px-2 py-0.5 rounded mt-1 inline-block uppercase">
                      {doc.owner.role}
                    </span>
                  </div>
                </div>
              </MetaCard>
            </section>

            {/* File / Cover links */}
            {(doc.fileUrl || doc.coverImageUrl) && (
              <section className="bg-[#f5f5f0] border border-graphite-border p-6">
                <h3 className="font-label-sm text-[#76777b] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">attachment</span>
                  Files &amp; Resources
                </h3>
                <div className="space-y-2">
                  {doc.fileUrl && (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-3 bg-white border border-graphite-border rounded-sm hover:border-[#460002] transition-all group"
                    >
                      <span className="material-symbols-outlined text-[20px] text-[#76777b] group-hover:text-[#460002]">
                        picture_as_pdf
                      </span>
                      <span className="font-label-md flex-1 text-[#030509] truncate">
                        {doc.fileUrl}
                      </span>
                      <span className="material-symbols-outlined text-[18px] text-[#76777b] group-hover:text-[#460002]">
                        open_in_new
                      </span>
                    </a>
                  )}
                  {doc.coverImageUrl && (
                    <a
                      href={doc.coverImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-3 bg-white border border-graphite-border rounded-sm hover:border-[#460002] transition-all group"
                    >
                      <span className="material-symbols-outlined text-[20px] text-[#76777b] group-hover:text-[#460002]">
                        image
                      </span>
                      <span className="font-label-md flex-1 text-[#030509] truncate">
                        {doc.coverImageUrl}
                      </span>
                      <span className="material-symbols-outlined text-[18px] text-[#76777b] group-hover:text-[#460002]">
                        open_in_new
                      </span>
                    </a>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* ─── Side column ───────────────────────────────────────── */}
          <aside className="lg:col-span-4 space-y-4">
            {/* Cover preview */}
            {doc.coverImageUrl ? (
              <div className="border border-graphite-border overflow-hidden bg-white">
                <div className="aspect-[3/4] bg-[#e9e8e4] relative">
                  <Image
                    src={doc.coverImageUrl}
                    alt="Cover"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <p className="font-label-sm text-[#76777b] px-4 py-3 text-center uppercase tracking-widest">
                  Cover Image
                </p>
              </div>
            ) : (
              <div className="border border-dashed border-graphite-border p-8 flex flex-col items-center gap-3 text-center">
                <span className="material-symbols-outlined text-[40px] text-[#c7c6cb]">image</span>
                <p className="font-label-sm text-[#76777b]">No cover image</p>
              </div>
            )}

            {/* Quick info card */}
            <div className="bg-[#f5f5f0] border border-graphite-border p-5 paper-texture">
              <h3 className="font-label-sm text-[#76777b] uppercase tracking-widest mb-4">
                Quick Info
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-label-md text-[#76777b]">Status</span>
                  <StatusBadge status={doc.status} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-label-md text-[#76777b]">Grade</span>
                  <span className="font-label-md font-bold text-[#030509]">
                    Grade {doc.gradeLevel}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-label-md text-[#76777b]">Subject</span>
                  <span className="font-label-md font-bold text-[#030509]">{doc.subject}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function MetaCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#f5f5f0] border border-graphite-border p-6">
      <h3 className="font-label-sm text-[#76777b] uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[16px]">{icon}</span>
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-dashed border-graphite-border last:border-0">
      <span className="font-label-md text-[#76777b]">{label}</span>
      <span className="font-label-md font-semibold text-[#030509]">{value}</span>
    </div>
  );
}

function DeleteModal({
  title,
  deleting,
  onConfirm,
  onCancel,
}: {
  title: string;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white border border-graphite-border p-8 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#ffdad6] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px] text-[#ba1a1a]">warning</span>
          </div>
          <div>
            <h3 className="font-label-md font-bold text-[#030509] mb-1">Delete Document?</h3>
            <p className="font-label-md text-[#76777b]">
              Are you sure you want to delete{' '}
              <strong className="text-[#030509]">&quot;{title}&quot;</strong>? This action cannot be
              undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            id="btn-confirm-delete"
            onClick={onConfirm}
            disabled={deleting}
            className="flex items-center gap-2 bg-[#ba1a1a] text-white font-label-md px-5 py-2.5 hover:opacity-90 transition-all disabled:opacity-60 active:scale-[0.98]"
          >
            {deleting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">
                  progress_activity
                </span>
                Deleting...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">delete</span>
                Yes, Delete
              </>
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={deleting}
            className="px-5 py-2.5 border border-graphite-border bg-white font-label-md text-[#76777b] hover:bg-[#e9e8e4] transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
