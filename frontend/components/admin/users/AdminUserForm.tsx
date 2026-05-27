'use client';

import React, { useState } from 'react';
import { ApiError, Role } from '../../../lib/api';

interface FormValues {
  email: string;
  password?: string;
  fullName: string;
  role?: Role;
  avatarUrl?: string;
}

interface AdminUserFormProps {
  initialValues?: Partial<FormValues>;
  isEditMode?: boolean;
  onSubmit: (values: FormValues) => Promise<void>;
  onCancel: () => void;
  submitButtonText: string;
  loadingText: string;
}

export default function AdminUserForm({
  initialValues = {},
  isEditMode = false,
  onSubmit,
  onCancel,
  submitButtonText,
  loadingText,
}: AdminUserFormProps) {
  const [email, setEmail] = useState(initialValues.email || '');
  const [password, setPassword] = useState(initialValues.password || '');
  const [fullName, setFullName] = useState(initialValues.fullName || '');
  const [role, setRole] = useState<Role>(initialValues.role || 'USER');
  const [avatarUrl, setAvatarUrl] = useState(initialValues.avatarUrl || '');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName || fullName.trim().length < 2) {
      newErrors.fullName = 'Full Name must be at least 2 characters.';
    } else if (fullName.length > 100) {
      newErrors.fullName = 'Full Name cannot exceed 100 characters.';
    }

    if (!email) {
      newErrors.email = 'Email is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Invalid email address.';
      }
    }

    if (!isEditMode) {
      if (!password || password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters.';
      }
    }

    if (avatarUrl) {
      try {
        new URL(avatarUrl);
      } catch {
        newErrors.avatarUrl = 'Invalid URL format.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setFormError(null);

    const values: FormValues = {
      email,
      fullName,
      avatarUrl: avatarUrl || undefined,
    };

    if (!isEditMode) {
      values.password = password;
      values.role = role;
    }

    try {
      await onSubmit(values);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        setErrors((prev) => ({ ...prev, email: 'Email already exists' }));
      } else if (err instanceof ApiError) {
        // Handle class-validator field specific errors
        const message = err.errors.join(', ');
        if (message.toLowerCase().includes('email')) {
          setErrors((prev) => ({ ...prev, email: message }));
        } else if (message.toLowerCase().includes('fullname')) {
          setErrors((prev) => ({ ...prev, fullName: message }));
        } else if (message.toLowerCase().includes('password')) {
          setErrors((prev) => ({ ...prev, password: message }));
        } else if (message.toLowerCase().includes('avatarurl')) {
          setErrors((prev) => ({ ...prev, avatarUrl: message }));
        } else {
          setFormError(message);
        }
      } else {
        setFormError('Something went wrong. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="p-4 border border-[#ba1a1a] bg-[#ffdad6] text-[#ba1a1a] font-label-md">
          <div className="font-bold mb-1">Error</div>
          <p className="font-body-md">{formError}</p>
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="font-label-sm text-[#76777b] uppercase tracking-widest block" htmlFor="user-fullname">
          Full Name <span className="text-[#ba1a1a]">*</span>
        </label>
        <input
          id="user-fullname"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={loading}
          placeholder="e.g. John Doe"
          className={`w-full bg-white border px-4 py-2.5 font-body-md outline-none transition-all ${
            errors.fullName
              ? 'border-[#ba1a1a] focus:border-[#ba1a1a]'
              : 'border-graphite-border focus:border-[#030509]'
          }`}
        />
        {errors.fullName && <p className="font-label-sm text-[#ba1a1a]">{errors.fullName}</p>}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="font-label-sm text-[#76777b] uppercase tracking-widest block" htmlFor="user-email">
          Email Address <span className="text-[#ba1a1a]">*</span>
        </label>
        <input
          id="user-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          placeholder="e.g. john@edupub.test"
          className={`w-full bg-white border px-4 py-2.5 font-body-md outline-none transition-all ${
            errors.email ? 'border-[#ba1a1a] focus:border-[#ba1a1a]' : 'border-graphite-border focus:border-[#030509]'
          }`}
        />
        {errors.email && <p className="font-label-sm text-[#ba1a1a]">{errors.email}</p>}
      </div>

      {/* Password - Only in Create mode */}
      {!isEditMode && (
        <div className="space-y-1.5">
          <label className="font-label-sm text-[#76777b] uppercase tracking-widest block" htmlFor="user-password">
            Password <span className="text-[#ba1a1a]">*</span>
          </label>
          <input
            id="user-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            placeholder="Min 6 characters"
            className={`w-full bg-white border px-4 py-2.5 font-body-md outline-none transition-all ${
              errors.password
                ? 'border-[#ba1a1a] focus:border-[#ba1a1a]'
                : 'border-graphite-border focus:border-[#030509]'
            }`}
          />
          {errors.password && <p className="font-label-sm text-[#ba1a1a]">{errors.password}</p>}
        </div>
      )}

      {/* Role - Only in Create mode */}
      {!isEditMode && (
        <div className="space-y-1.5">
          <label className="font-label-sm text-[#76777b] uppercase tracking-widest block" htmlFor="user-role">
            System Role <span className="text-[#ba1a1a]">*</span>
          </label>
          <select
            id="user-role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            disabled={loading}
            className="w-full bg-white border border-graphite-border px-3 py-2.5 font-label-md focus:border-[#030509] outline-none"
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
      )}

      {/* Avatar URL */}
      <div className="space-y-1.5">
        <label className="font-label-sm text-[#76777b] uppercase tracking-widest block" htmlFor="user-avatar">
          Avatar URL
        </label>
        <input
          id="user-avatar"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          disabled={loading}
          placeholder="https://example.com/avatar.jpg"
          className={`w-full bg-white border px-4 py-2.5 font-body-md outline-none transition-all ${
            errors.avatarUrl
              ? 'border-[#ba1a1a] focus:border-[#ba1a1a]'
              : 'border-graphite-border focus:border-[#030509]'
          }`}
        />
        {errors.avatarUrl && <p className="font-label-sm text-[#ba1a1a]">{errors.avatarUrl}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4 border-t border-graphite-border">
        <button
          id="btn-submit-user"
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#E4554A] text-white font-label-md py-3 px-6 hover:brightness-95 transition-all active:scale-[0.99] flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
              {loadingText}
            </>
          ) : (
            submitButtonText
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-3 border border-graphite-border bg-white font-label-md text-[#76777b] hover:bg-[#e9e8e4] transition-all active:scale-[0.99]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
