'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import SideNav from '../../components/SideNav';

export default function DocumentsLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f5]">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-[32px] text-[#e5564b]">
            progress_activity
          </span>
          <span className="font-label-md text-[#76777b]">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      <SideNav />

      {/* Main wrapper offset for side nav */}
      <div className="md:ml-64 flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-4 bg-[#faf9f5] border-b border-graphite-border">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 font-label-md text-[#76777b] pl-12 md:pl-0">
            <Link href="/documents" className="hover:text-[#030509] transition-colors">
              Documents
            </Link>
            {pathname !== '/documents' && pathname !== '/admin/documents' && (
              <>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                <span className="text-[#030509] truncate max-w-[100px] sm:max-w-none">
                  {pathname.endsWith('/edit')
                    ? 'Edit'
                    : pathname.endsWith('/new')
                      ? 'New Document'
                      : 'Detail'}
                </span>
              </>
            )}
          </nav>

          {/* Right side: search + new button */}
          <div className="flex items-center gap-4">
            <Link
              href="/documents/new"
              className="flex items-center gap-1.5 bg-[#E4554A] text-white font-label-md px-3 py-2 sm:px-4 rounded-sm hover:brightness-95 transition-all active:scale-[0.98]"
              title="New Document"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="hidden sm:inline">New Document</span>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-8 py-8 max-w-[1140px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
