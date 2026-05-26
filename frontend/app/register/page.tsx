'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);

    try {
      await register(email, password, fullName);
      router.push('/');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrors(err.errors);
      } else {
        setErrors([(err as Error).message || 'An unexpected error occurred.']);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#faf9f5] selection:bg-[#e5564b] selection:text-white"
      style={{
        backgroundImage: 'radial-gradient(#d1d5db 0.5px, transparent 0.5px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Main centred column */}
      <main className="flex-grow w-full flex flex-col items-center justify-center px-4 py-16">
        {/* Registration Card */}
        <div className="w-full max-w-[440px] bg-[#faf9f5] border border-[#d1d5db] overflow-hidden shadow-sm">
          {/* Card Header */}
          <div className="px-8 pt-8 pb-6 border-b border-[#d1d5db] bg-[#f5f5f0]">
            <h1
              className="text-[24px] leading-[32px] font-semibold tracking-tight text-[#030509]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              EduPub Manager
            </h1>
            <p className="text-[16px] leading-[24px] text-[#46464b] mt-1">
              New Academic Manuscript Account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
            {/* Error Message Box */}
            {errors.length > 0 && (
              <div className="p-4 border border-[#ba1a1a] bg-[#ffdad6] text-[#ba1a1a]">
                {errors.some((err) => err.toLowerCase().includes('already exists')) ? (
                  <p className="text-[16px]">{errors[0]}</p>
                ) : (
                  <>
                    <div className="font-semibold text-[14px] mb-2">
                      Please correct the following errors:
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((err, idx) => (
                        <li key={idx} className="text-[14px]">
                          {err}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-1">
              <label
                className="block text-[12px] font-semibold tracking-[0.1em] uppercase text-[#46464b]"
                htmlFor="full_name"
              >
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full bg-white border border-[#d1d5db] px-4 py-3 text-[16px] text-[#0f1115] placeholder:text-[#76777b] focus:border-[#030509] focus:ring-1 focus:ring-[#030509] outline-none transition-all"
              />
            </div>

            {/* Academic Email */}
            <div className="space-y-1">
              <label
                className="block text-[12px] font-semibold tracking-[0.1em] uppercase text-[#46464b]"
                htmlFor="email"
              >
                Academic Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="blackwell@university.edu"
                required
                className="w-full bg-white border border-[#d1d5db] px-4 py-3 text-[16px] text-[#0f1115] placeholder:text-[#76777b] focus:border-[#030509] focus:ring-1 focus:ring-[#030509] outline-none transition-all"
              />
            </div>

            {/* Security Password */}
            <div className="space-y-1">
              <label
                className="block text-[12px] font-semibold tracking-[0.1em] uppercase text-[#46464b]"
                htmlFor="password"
              >
                Security Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-white border border-[#d1d5db] px-4 py-3 text-[16px] text-[#0f1115] placeholder:text-[#76777b] focus:border-[#030509] focus:ring-1 focus:ring-[#030509] outline-none transition-all"
              />
              <p className="text-[12px] text-[#46464b] opacity-70 mt-1">
                Min. 6 characters with scholarly rigor.
              </p>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 border-[#d1d5db] text-[#e5564b] focus:ring-0 focus:ring-offset-0 flex-shrink-0"
              />
              <label
                className="text-[14px] leading-[20px] text-[#46464b] select-none cursor-pointer"
                htmlFor="terms"
              >
                I agree to the{' '}
                <a
                  className="text-[#030509] underline underline-offset-4 hover:text-[#e5564b] transition-colors"
                  href="#"
                >
                  Terms of Publication
                </a>{' '}
                and Ethics Guidelines.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full bg-[#E4554A] text-white py-4 text-[14px] font-semibold tracking-[0.02em] transition-all hover:bg-[#c93e34] active:scale-[0.99] flex justify-center items-center gap-2 ${submitting ? 'opacity-80 cursor-wait' : ''
                }`}
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">
                    progress_activity
                  </span>
                  Registering Account...
                </>
              ) : (
                'Register Account'
              )}
            </button>

            {/* Link to login */}
            <div className="text-center pt-2">
              <p className="text-[16px] text-[#46464b]">
                Already registered?{' '}
                <Link
                  href="/login"
                  className="text-[#030509] font-bold hover:underline underline-offset-4"
                >
                  Sign in to Dashboard
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#d1d5db] bg-[#faf9f5]">
        <div className="flex flex-col md:flex-row justify-between items-center py-6 px-8 max-w-[1140px] mx-auto">
          <div className="mb-3 md:mb-0">
            <span className="text-[14px] font-bold text-[#030509]">EduPub Manager</span>
            <p className="text-[12px] text-[#46464b] mt-0.5">
              © 2026 EduPub Manager. Scholarly Excellence.
            </p>
          </div>
          <div className="flex gap-6">
            <a className="text-[12px] text-[#46464b] hover:underline transition-all" href="#">
              Terms of Service
            </a>
            <a className="text-[12px] text-[#46464b] hover:underline transition-all" href="#">
              Privacy Policy
            </a>
            <a className="text-[12px] text-[#46464b] hover:underline transition-all" href="#">
              Contact Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
