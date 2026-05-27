'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../../lib/api';

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // States to manage visual label coloring when inputs are focused
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMsg(err.errors.join(', '));
      } else {
        setErrorMsg((err as Error).message || 'An unexpected error occurred.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col selection:bg-[#e5564b] selection:text-white bg-[#faf9f5]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Top Navigation */}
      <header className="w-full top-0 sticky bg-surface border-b border-graphite-border z-50">
        <div className="flex justify-between items-center px-margin-edge py-4 max-w-page-max-width mx-auto">
          <div className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-[#e5564b]" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_stories
            </span>
            <span className="font-scholarly tracking-wide text-[#030509]">EduPub Manager</span>
          </div>
          <div className="hidden md:block">
            <span className="font-label-md text-on-surface-variant italic">Scholarly Excellence.</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-margin-edge py-12 relative overflow-hidden">
        {/* Background decorative elements: Subtle grid lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20 moleskine-ruled"></div>

        {/* Login Card */}
        <div className="w-full max-w-[480px] bg-[#faf9f5] border border-[#d1d5db] p-10 md:p-12 z-10 shadow-sm">
          <div className="mb-8 text-center">
            <h1
              className="mb-2 text-[#0f1115]"
              style={{
                fontFamily: "'Patrick Hand', cursive",
                fontSize: '48px',
                lineHeight: '56px',
                fontWeight: 400,
              }}
            >
              Welcome Back
            </h1>
            <p className="text-[16px] leading-[24px] text-[#46464b]">Access your manuscript and reviews.</p>
          </div>

          {/* Error Message Display */}
          {errorMsg && (
            <div className="mb-6 p-4 border border-[#ba1a1a] bg-[#ffdad6] text-[#ba1a1a] font-label-md">
              <p className="font-body-md">{errorMsg}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                className={`block text-[14px] font-medium leading-[20px] tracking-[0.02em] transition-colors duration-200 ${
                  emailFocused ? 'text-[#e5564b]' : 'text-[#030509]'
                }`}
                htmlFor="email"
              >
                Institutional Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="e.g., professor@university.edu"
                required
                className="w-full bg-white border border-[#d1d5db] px-4 py-3 text-[16px] text-[#0f1115] focus:border-[#0f1115] focus:ring-1 focus:ring-[#0f1115] outline-none transition-all placeholder:text-[#c7c6cb]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  className={`block text-[14px] font-medium leading-[20px] tracking-[0.02em] transition-colors duration-200 ${
                    passwordFocused ? 'text-[#e5564b]' : 'text-[#030509]'
                  }`}
                  htmlFor="password"
                >
                  Password
                </label>
                <a className="font-label-sm text-[#e5564b] hover:underline transition-all" href="#">
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder="••••••••"
                required
                className="w-full bg-white border border-[#d1d5db] px-4 py-3 text-[16px] text-[#0f1115] focus:border-[#0f1115] focus:ring-1 focus:ring-[#0f1115] outline-none transition-all placeholder:text-[#c7c6cb]"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 border-[#d1d5db] text-[#e5564b] focus:ring-0"
              />
              <label className="text-[14px] font-medium text-[#46464b] cursor-pointer select-none" htmlFor="remember">
                Keep me signed in
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full bg-[#E4554A] text-white text-[14px] font-semibold tracking-[0.02em] py-4 px-6 hover:bg-[#c93e34] transition-all active:scale-[0.99] flex justify-center items-center gap-2 ${
                submitting ? 'opacity-80 cursor-wait' : ''
              }`}
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  Authenticating...
                </>
              ) : (
                <>
                  Continue to Dashboard
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-8 text-center">
            <p className="text-[16px] text-[#46464b]">
              New to EduPub?{' '}
              <Link href="/register" className="text-[#030509] font-bold hover:underline transition-all">
                Submit a Manuscript
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative Illustration */}
        <div className="hidden lg:block absolute right-[-100px] top-1/2 -translate-y-1/2 opacity-10 rotate-3 pointer-events-none">
          <Image
            alt="Antique scientific journal illustration"
            className="w-[600px] grayscale"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDv_6-2sL41d5BiHDQfUpdHNXX3QkO5lhgycgmlPrjMY8HG2kr2OoKrR7GZCd5HcJR2xBLo-Ubn1vm48eVFazagQlfw5dgDCBe7RJ_xd_3GXMWnV97wAXB3cjU8HaDPhsfzz-C6NJu-dxfhMpZvDq-QLdtoy63iuqDjelXninMMv3FuOnUVijaKcYTgIRBGmxv3xI3Bs969kNxU67J2ZpO4300vJzec_pwxPcsJHMwpI9r4BidNXApjqZUkqCyGLQ1fkx5TuDpRZQj0"
            width={600}
            height={600}
            unoptimized
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto bg-[#faf9f5] border-t border-[#d1d5db] relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center py-8 px-margin-edge max-w-page-max-width mx-auto">
          <div className="mb-4 md:mb-0">
            <span className="text-[14px] font-bold text-[#030509]">EduPub Manager</span>
            <span className="mx-2 text-[#76777b]">|</span>
            <span className="text-[12px] text-[#46464b]">© 2024. Scholarly Excellence.</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a className="text-[12px] text-[#46464b] hover:underline transition-all" href="#">
              Terms of Service
            </a>
            <a className="text-[12px] text-[#46464b] hover:underline transition-all" href="#">
              Privacy Policy
            </a>
            <a className="text-[12px] text-[#46464b] hover:underline transition-all" href="#">
              Accessibility
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
