'use client';

import Image from 'next/image';
import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';
import { ApiError, uploadImage } from '../../lib/api';
import { resolveUploadUrl } from '../../lib/uploads/url';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 20 * 1024 * 1024;

interface CoverImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  onUploadingChange?: (isUploading: boolean) => void;
}

export default function CoverImageUpload({ value, onChange, disabled, onUploadingChange }: CoverImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewUrl = value ? resolveUploadUrl(value) : null;

  const setUploading = (nextValue: boolean) => {
    setIsUploading(nextValue);
    onUploadingChange?.(nextValue);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Invalid image type. Please upload JPG, PNG, WEBP, or GIF.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError('Image size must be less than 20MB.');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const response = await uploadImage(file);
      onChange(response.path);
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
    <section className="space-y-3" aria-labelledby="cover-image-upload-label">
      <div>
        <h3 id="cover-image-upload-label" className="font-label-sm text-[#76777b] uppercase tracking-widest">
          Cover Image
        </h3>
        <p className="font-label-sm text-[#76777b] mt-1">
          Upload a cover image for this document. JPG, PNG, WEBP, or GIF. Max 20MB.
        </p>
      </div>

      {previewUrl ? (
        <div className="border border-graphite-border bg-white overflow-hidden">
          <div className="relative aspect-[16/9] bg-[#e9e8e4]">
            <Image src={previewUrl} alt="Cover image preview" fill className="object-cover" unoptimized />
          </div>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate px-4 py-3 font-label-sm text-[#030509] hover:text-[#E4554A]"
          >
            {value}
          </a>
        </div>
      ) : (
        <div className="border border-dashed border-graphite-border bg-white p-5 flex items-center gap-3 text-[#76777b]">
          <span className="material-symbols-outlined text-[28px]">image</span>
          <span className="font-label-md">No cover image uploaded.</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          ref={inputRef}
          id="doc-cover-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="sr-only"
        />
        <label
          htmlFor="doc-cover-upload"
          className={`inline-flex justify-center items-center gap-2 border border-[#460002] bg-white px-5 py-2.5 font-label-md text-[#460002] transition-all sm:w-auto w-full ${
            disabled || isUploading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-[#fff1ef] active:scale-[0.98]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">upload</span>
          Choose Image
        </label>

        {value && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled || isUploading}
            className="inline-flex justify-center items-center gap-2 border border-graphite-border bg-white px-5 py-2.5 font-label-md text-[#76777b] hover:bg-[#e9e8e4] transition-all active:scale-[0.98] disabled:opacity-60 sm:w-auto w-full"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
            Remove Image
          </button>
        )}
      </div>

      {isUploading && <p className="font-label-md text-[#76777b]">Uploading image...</p>}
      {error && (
        <p id="doc-cover-upload-error" className="font-label-md text-[#ba1a1a]" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
