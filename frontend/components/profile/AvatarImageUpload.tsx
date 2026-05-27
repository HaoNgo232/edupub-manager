'use client';

import Image from 'next/image';
import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';
import { ApiError, uploadImage } from '../../lib/api';
import { resolveUploadUrl } from '../../lib/uploads/url';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 20 * 1024 * 1024;

interface AvatarImageUploadProps {
  value?: string | null;
  fullName: string;
  disabled?: boolean;
  onChange: (url: string | null) => void;
  onUploadingChange?: (isUploading: boolean) => void;
}

export default function AvatarImageUpload({
  value,
  fullName,
  disabled,
  onChange,
  onUploadingChange,
}: AvatarImageUploadProps) {
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
    <section className="space-y-3" aria-labelledby="avatar-upload-label">
      <div>
        <h4 id="avatar-upload-label" className="font-label-sm text-on-surface-variant uppercase tracking-widest">
          Avatar Image
        </h4>
        <p className="font-label-sm text-on-surface-variant">JPG, PNG, WEBP, or GIF. Max 20MB.</p>
      </div>

      <div className="flex items-center gap-4">
        {previewUrl && (
          <Image
            src={previewUrl}
            alt={`${fullName || 'User'} avatar preview`}
            width={72}
            height={72}
            className="w-[72px] h-[72px] rounded-full object-cover border border-graphite-border bg-white"
            unoptimized
          />
        )}

        <div className="flex-1 min-w-0">
          {isUploading && <p className="font-label-md text-on-surface-variant">Uploading image...</p>}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          ref={inputRef}
          id="profile-avatar-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="sr-only"
        />
        <label
          htmlFor="profile-avatar-upload"
          className={`inline-flex justify-center items-center gap-2 border border-[#460002] bg-white px-4 py-2.5 font-label-md text-[#460002] transition-all sm:w-auto w-full ${disabled || isUploading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-[#fff1ef] active:scale-[0.98]'
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
            className="inline-flex justify-center items-center gap-2 border border-graphite-border bg-white px-4 py-2.5 font-label-md text-on-surface-variant hover:bg-[#e9e8e4] transition-all active:scale-[0.98] disabled:opacity-60 sm:w-auto w-full"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
            Remove Image
          </button>
        )}
      </div>

      {error && (
        <p className="font-label-md text-[#ba1a1a]" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
