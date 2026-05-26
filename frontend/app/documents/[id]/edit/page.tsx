'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getDocument,
  updateDocument,
  UpdateDocumentRequest,
  Subject,
  ApiError,
} from '../../../../lib/api';
import { SUBJECT_OPTIONS, STATUS_OPTIONS } from '../../../lib/constants/documents.constants';

type FormState = Required<UpdateDocumentRequest>;

export default function EditDocumentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    subject: 'MATH',
    gradeLevel: 10,
    status: 'DRAFT',
    coverImageUrl: '',
    fileUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const doc = await getDocument(id);
        setForm({
          title: doc.title,
          description: doc.description ?? '',
          subject: doc.subject,
          gradeLevel: doc.gradeLevel,
          status: doc.status,
          coverImageUrl: doc.coverImageUrl ?? '',
          fileUrl: doc.fileUrl ?? '',
        });
      } catch (err) {
        if (err instanceof ApiError && err.statusCode === 404) {
          setFetchError('Document not found or you do not have permission to edit it.');
        } else {
          setFetchError('Failed to load document.');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setErrors([]);
    setSubmitting(true);

    const payload: UpdateDocumentRequest = {
      title: form.title,
      subject: form.subject,
      gradeLevel: Number(form.gradeLevel),
      status: form.status,
    };
    if (form.description !== undefined) payload.description = form.description || undefined;
    if (form.coverImageUrl !== undefined) payload.coverImageUrl = form.coverImageUrl || undefined;
    if (form.fileUrl !== undefined) payload.fileUrl = form.fileUrl || undefined;

    try {
      await updateDocument(id, payload);
      router.push(`/documents/${id}`);
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.errors);
      else setErrors(['An unexpected error occurred.']);
      setSubmitting(false);
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

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#ffdad6] flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px] text-[#ba1a1a]">error</span>
        </div>
        <p className="font-label-md text-[#ba1a1a] max-w-sm">{fetchError}</p>
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-headline-lg text-[#030509]">Edit Document</h2>
        <p className="font-label-md text-[#76777b] mt-1">Update the details of your document.</p>
      </div>

      {/* Error banner */}
      {errors.length > 0 && (
        <div className="p-4 border border-[#ba1a1a] bg-[#ffdad6] rounded-sm">
          <p className="font-label-md font-bold text-[#ba1a1a] mb-1">
            Please fix the following errors:
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            {errors.map((e, i) => (
              <li key={i} className="font-label-md text-[#ba1a1a]">
                {e}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Form card */}
      <form
        id="form-edit-document"
        onSubmit={handleSubmit}
        className="bg-[#f5f5f0] border border-graphite-border p-8 space-y-6 relative overflow-hidden"
      >
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#460002]" />

        {/* Title */}
        <FormField label="Title *" htmlFor="doc-title">
          <input
            id="doc-title"
            type="text"
            required
            minLength={3}
            maxLength={200}
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            className={inputClass}
          />
        </FormField>

        {/* Description */}
        <FormField label="Description" htmlFor="doc-description">
          <textarea
            id="doc-description"
            rows={3}
            maxLength={2000}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className={`${inputClass} resize-none`}
          />
          <span className="font-label-sm text-[#76777b] text-right block mt-1">
            {(form.description ?? '').length}/2000
          </span>
        </FormField>

        {/* Subject + Grade */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Subject *" htmlFor="doc-subject">
            <select
              id="doc-subject"
              required
              value={form.subject}
              onChange={(e) => update('subject', e.target.value as Subject)}
              className={inputClass}
            >
              {SUBJECT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Grade Level *" htmlFor="doc-grade">
            <input
              id="doc-grade"
              type="number"
              required
              min={1}
              max={12}
              value={form.gradeLevel}
              onChange={(e) => update('gradeLevel', Number(e.target.value))}
              className={inputClass}
            />
            <span className="font-label-sm text-[#76777b] mt-1 block">Grade 1–12</span>
          </FormField>
        </div>

        {/* Status */}
        <FormField label="Status" htmlFor="doc-status">
          <div className="grid grid-cols-3 gap-2">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.value}
                type="button"
                id={`status-${s.value.toLowerCase()}`}
                onClick={() => update('status', s.value)}
                className={`border p-3 text-left transition-all rounded-sm ${
                  form.status === s.value
                    ? 'border-[#460002] bg-white shadow-sm'
                    : 'border-graphite-border bg-white hover:border-[#76777b]'
                }`}
              >
                <p className="font-label-md font-bold text-[#030509]">{s.label}</p>
                <p className="font-label-sm text-[#76777b] mt-0.5">{s.description}</p>
              </button>
            ))}
          </div>
        </FormField>

        {/* URLs */}
        <FormField label="Cover Image URL" htmlFor="doc-cover">
          <input
            id="doc-cover"
            type="url"
            value={form.coverImageUrl}
            onChange={(e) => update('coverImageUrl', e.target.value)}
            placeholder="https://example.com/cover.png"
            className={inputClass}
          />
        </FormField>

        <FormField label="File URL" htmlFor="doc-file">
          <input
            id="doc-file"
            type="url"
            value={form.fileUrl}
            onChange={(e) => update('fileUrl', e.target.value)}
            placeholder="https://example.com/document.pdf"
            className={inputClass}
          />
        </FormField>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            id="btn-submit-edit"
            disabled={submitting}
            className="flex items-center gap-2 bg-[#E4554A] text-white font-label-md px-6 py-3 hover:brightness-95 transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">
                  progress_activity
                </span>
                Saving...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                Save Changes
              </>
            )}
          </button>
          <Link
            href={`/documents/${id}`}
            className="flex items-center gap-2 px-6 py-3 border border-graphite-border bg-white font-label-md text-[#76777b] hover:bg-[#e9e8e4] transition-all active:scale-[0.98]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

const inputClass =
  'w-full bg-white border border-graphite-border px-4 py-2.5 font-label-md focus:border-[#030509] focus:ring-0 outline-none transition-all placeholder:text-[#c7c6cb]';

function FormField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="font-label-sm text-[#76777b] uppercase tracking-widest block"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
