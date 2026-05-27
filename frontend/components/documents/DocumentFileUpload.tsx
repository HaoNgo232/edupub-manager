'use client';

import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';
import { ApiError, uploadDocumentFile } from '../../lib/api';

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface DocumentFileUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  onUploadingChange?: (isUploading: boolean) => void;
}

function getFileLabel(value: string): string {
  try {
    const url = new URL(value);
    return decodeURIComponent(url.pathname.split('/').pop() || value);
  } catch {
    return value.split('/').pop() || value;
  }
}

export default function DocumentFileUpload({ value, onChange, disabled, onUploadingChange }: DocumentFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileLabel = value ? getFileLabel(value) : null;

  const setUploading = (nextValue: boolean) => {
    setIsUploading(nextValue);
    onUploadingChange?.(nextValue);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('Invalid file type. Please upload PDF, Word, Excel, PowerPoint, or TXT.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 10MB.');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const response = await uploadDocumentFile(file);
      onChange(response.url);
    } catch (err) {
      if (err instanceof ApiError && err.errors.length > 0) {
        setError(err.errors[0]);
      } else {
        setError('Upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <section className="space-y-3" aria-labelledby="document-file-upload-label">
      <div>
        <h3 id="document-file-upload-label" className="font-label-sm text-[#76777b] uppercase tracking-widest">
          Document File
        </h3>
        <p className="font-label-sm text-[#76777b] mt-1">
          Upload a PDF, Word, Excel, PowerPoint, or TXT file. Max 10MB.
        </p>
      </div>

      {value && fileLabel ? (
        <div className="flex items-center gap-3 p-4 bg-white border border-graphite-border min-w-0">
          <span className="material-symbols-outlined text-[24px] text-[#76777b]">description</span>
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="font-label-md text-[#030509] hover:text-[#E4554A] truncate flex-1"
            aria-label={`Open File ${fileLabel}`}
          >
            {fileLabel}
          </a>
          <span className="material-symbols-outlined text-[18px] text-[#76777b]">open_in_new</span>
        </div>
      ) : (
        <div className="border border-dashed border-graphite-border bg-white p-5 flex items-center gap-3 text-[#76777b]">
          <span className="material-symbols-outlined text-[28px]">description</span>
          <span className="font-label-md">No document file uploaded.</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          ref={inputRef}
          id="doc-file-upload"
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="sr-only"
        />
        <label
          htmlFor="doc-file-upload"
          className={`inline-flex justify-center items-center gap-2 border border-[#460002] bg-white px-5 py-2.5 font-label-md text-[#460002] transition-all sm:w-auto w-full ${
            disabled || isUploading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-[#fff1ef] active:scale-[0.98]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">upload_file</span>
          Choose File
        </label>

        {value && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled || isUploading}
            className="inline-flex justify-center items-center gap-2 border border-graphite-border bg-white px-5 py-2.5 font-label-md text-[#76777b] hover:bg-[#e9e8e4] transition-all active:scale-[0.98] disabled:opacity-60 sm:w-auto w-full"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
            Remove File
          </button>
        )}
      </div>

      {isUploading && <p className="font-label-md text-[#76777b]">Uploading file...</p>}
      {error && (
        <p id="doc-file-upload-error" className="font-label-md text-[#ba1a1a]" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
