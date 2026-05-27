'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDocument, CreateDocumentRequest, Subject, ApiError } from '../../../lib/api';
import { SUBJECT_OPTIONS, STATUS_OPTIONS } from '../../lib/constants/documents.constants';

const initialForm: CreateDocumentRequest = {
  title: '',
  description: '',
  subject: 'MATH',
  gradeLevel: 10,
  status: 'DRAFT',
  coverImageUrl: '',
  fileUrl: '',
};

export default function NewDocumentPage() {
  const router = useRouter();
  const [form, setForm] = useState<CreateDocumentRequest>(initialForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof CreateDocumentRequest>(key: K, value: CreateDocumentRequest[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);

    // Build clean payload
    const payload: CreateDocumentRequest = {
      title: form.title,
      subject: form.subject,
      gradeLevel: Number(form.gradeLevel),
      status: form.status,
    };
    if (form.description) payload.description = form.description;
    if (form.coverImageUrl) payload.coverImageUrl = form.coverImageUrl;
    if (form.fileUrl) payload.fileUrl = form.fileUrl;

    try {
      const doc = await createDocument(payload);
      router.push(`/documents/${doc.id}`);
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.errors);
      else setErrors(['An unexpected error occurred.']);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-headline-lg text-[#030509]">New Document</h2>
        <p className="font-label-md text-[#76777b] mt-1">Fill in the details to create a new educational document.</p>
      </div>

      {/* Error banner */}
      {errors.length > 0 && (
        <div className="p-4 border border-[#ba1a1a] bg-[#ffdad6] rounded-none">
          <p className="font-label-md font-bold text-[#ba1a1a] mb-1">Please fix the following errors:</p>
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
        id="form-create-document"
        onSubmit={handleSubmit}
        className="bg-[#f5f5f0] border border-graphite-border p-8 space-y-6 relative overflow-hidden"
      >
        {/* Left accent bar */}
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
            placeholder="e.g. Introduction to Calculus"
            className={inputClass}
          />
        </FormField>

        {/* Description */}
        <FormField label="Description" htmlFor="doc-description">
          <textarea
            id="doc-description"
            rows={3}
            maxLength={2000}
            value={form.description ?? ''}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Brief overview of the document content..."
            className={`${inputClass} resize-none`}
          />
          <span className="font-label-sm text-[#76777b] text-right block mt-1">
            {(form.description ?? '').length}/2000
          </span>
        </FormField>

        {/* Subject + Grade row */}
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
                className={`border p-3 text-left transition-all rounded-none ${form.status === s.value
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

        {/* Optional URLs */}
        <FormField label="Cover Image URL" htmlFor="doc-cover">
          <input
            id="doc-cover"
            type="url"
            value={form.coverImageUrl ?? ''}
            onChange={(e) => update('coverImageUrl', e.target.value)}
            placeholder="https://example.com/cover.png"
            className={inputClass}
          />
        </FormField>

        <FormField label="File URL" htmlFor="doc-file">
          <input
            id="doc-file"
            type="url"
            value={form.fileUrl ?? ''}
            onChange={(e) => update('fileUrl', e.target.value)}
            placeholder="https://example.com/document.pdf"
            className={inputClass}
          />
        </FormField>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            id="btn-submit-document"
            disabled={submitting}
            className="flex items-center gap-2 bg-[#E4554A] text-white font-label-md px-6 py-3 hover:brightness-95 transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                Creating...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                Create Document
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push('/documents')}
            className="px-6 py-3 border border-graphite-border bg-white font-label-md text-[#76777b] hover:bg-[#e9e8e4] transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

const inputClass =
  'w-full bg-white border border-graphite-border px-4 py-2.5 font-label-md focus:border-[#030509] focus:ring-0 outline-none transition-all placeholder:text-[#c7c6cb]';

function FormField({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="font-label-sm text-[#76777b] uppercase tracking-widest block">
        {label}
      </label>
      {children}
    </div>
  );
}
