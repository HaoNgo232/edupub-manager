'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import { ApiError } from './lib/api';

export default function Home() {
  const { user, loading, logout, updateProfile } = useAuth();
  const router = useRouter();

  // Local form states
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Sync profile data once loaded
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFullName(user.fullName || '');

        setAvatarUrl(user.avatarUrl || '');
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f5] paper-texture">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-[32px] text-[#e5564b]">
            progress_activity
          </span>
          <span className="font-scholarly text-[20px] text-on-surface-variant">
            Opening your manuscript notebook...
          </span>
        </div>
      </div>
    );
  }

  const firstName = user.fullName ? user.fullName.split(' ')[0] : 'Scholar';

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setUpdating(true);

    try {
      await updateProfile(fullName, avatarUrl);
      setSuccessMsg('Profile updated successfully.');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMsg(err.errors.join(', '));
      } else {
        setErrorMsg((err as Error).message || 'An unexpected error occurred.');
      }
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f5] paper-texture relative selection:bg-on-tertiary-container selection:text-white">
      {/* Top Header */}
      <header className="w-full bg-[#faf9f5] border-b border-graphite-border z-10">
        <div className="flex justify-between items-center px-margin-edge py-4 max-w-page-max-width mx-auto">
          <div className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[#e5564b]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_stories
            </span>
            <span className="font-scholarly tracking-wide text-[#030509]">EduPub Manager</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden md:block font-label-md text-on-surface-variant italic">
              Scholarly Excellence.
            </span>
            <button
              onClick={logout}
              className="font-label-sm border border-graphite-border px-4 py-2 hover:bg-surface-container active:scale-[0.98] transition-all text-primary"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Main Ruled Dashboard Container */}
      <main className="flex-grow w-full max-w-page-max-width px-margin-edge py-12 mx-auto relative z-10">
        <div className="mb-8">
          <h1 className="font-scholarly text-headline-xl text-[#0f1115] mb-2">
            Welcome back, {firstName}
          </h1>
          <p className="font-body-md text-on-surface-variant">
            Manage your credentials and academic details.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card Column (takes 2 cols per test spec) */}
          <div className="lg:col-span-2 bg-[#f5f5f0] border border-graphite-border p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
            {/* Subtle notebook margins */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#e5564b]"></div>

            {/* Avatar Section */}
            <div className="flex-shrink-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-24 h-24 rounded-full object-cover border border-graphite-border bg-white"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border border-graphite-border bg-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[48px] text-on-surface-variant">
                    account_circle
                  </span>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="space-y-4 flex-grow">
              <div>
                <span className="font-label-sm text-on-surface-variant uppercase tracking-widest block mb-1">
                  Academic Title / Full Name
                </span>
                <h2 className="font-headline-md text-[#0f1115] font-bold">{user.fullName}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-label-sm text-on-surface-variant uppercase tracking-widest block mb-1">
                    Institutional Email
                  </span>
                  <span className="font-body-md text-primary">{user.email}</span>
                </div>
                <div>
                  <span className="font-label-sm text-on-surface-variant uppercase tracking-widest block mb-1">
                    System Role
                  </span>
                  <span className="inline-block bg-white border border-graphite-border px-3 py-1 font-label-sm text-[#030509]">
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-graphite-border">
                <p className="font-label-sm text-on-surface-variant italic">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Edit Profile Column */}
          <div className="bg-[#f5f5f0] border border-graphite-border p-8 relative">
            <h3 className="font-scholarly text-headline-md text-primary mb-6">
              Update Codex Details
            </h3>

            {errorMsg && (
              <div className="mb-6 p-4 border border-[#ba1a1a] bg-[#ffdad6] text-[#ba1a1a] font-label-md">
                <div className="font-bold mb-1">Update Failed</div>
                <p className="font-body-md">{errorMsg}</p>
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-4 border border-emerald-600 bg-emerald-50 text-emerald-800 font-label-md">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Note: Full Name Input (must match form >> input[type="text"]) */}
              <div className="space-y-2">
                <label
                  className="font-label-sm text-on-surface-variant uppercase tracking-widest block"
                  htmlFor="edit_fullname"
                >
                  Full Name
                </label>
                <input
                  id="edit_fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full bg-white border border-graphite-border px-4 py-3 focus:border-[#030509] focus:ring-2 focus:ring-inset focus:ring-[#030509]/5 outline-none transition-all placeholder:text-outline-variant font-body-md"
                />
              </div>

              {/* Note: Avatar URL Input (must match form >> input[type="url"]) */}
              <div className="space-y-2">
                <label
                  className="font-label-sm text-on-surface-variant uppercase tracking-widest block"
                  htmlFor="edit_avatar"
                >
                  Avatar URL
                </label>
                <input
                  id="edit_avatar"
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full bg-white border border-graphite-border px-4 py-3 focus:border-[#030509] focus:ring-2 focus:ring-inset focus:ring-[#030509]/5 outline-none transition-all placeholder:text-outline-variant font-body-md"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full bg-[#E4554A] text-white font-label-md py-4 px-6 hover:brightness-95 transition-all active:scale-[0.99] flex justify-center items-center gap-2"
              >
                {updating ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">
                      progress_activity
                    </span>
                    Saving Changes...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Ruled lines in the background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] moleskine-ruled z-0"></div>

      {/* Footer */}
      <footer className="w-full mt-auto bg-[#faf9f5] border-t border-graphite-border relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center py-8 px-margin-edge max-w-page-max-width mx-auto">
          <div className="mb-4 md:mb-0">
            <span className="font-label-md font-bold text-primary">EduPub Manager</span>
            <span className="mx-2 text-outline">|</span>
            <span className="font-label-sm text-on-surface-variant font-sans">
              © 2024. Scholarly Excellence.
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-gutter font-sans">
            <a
              className="font-label-sm text-on-surface-variant hover:underline transition-all"
              href="#"
            >
              Terms of Service
            </a>
            <a
              className="font-label-sm text-on-surface-variant hover:underline transition-all"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="font-label-sm text-on-surface-variant hover:underline transition-all"
              href="#"
            >
              Accessibility
            </a>
            <a
              className="font-label-sm text-on-surface-variant hover:underline transition-all"
              href="#"
            >
              Contact Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
