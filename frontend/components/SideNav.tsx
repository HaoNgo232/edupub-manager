'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '../app/context/AuthContext';
import { resolveUploadUrl } from '../lib/uploads/url';

const NAV_ITEMS = [
  { href: '/documents', icon: 'description', label: 'My Documents', roles: ['USER', 'ADMIN'] },
  { href: '/admin', icon: 'dashboard', label: 'Dashboard', roles: ['ADMIN'] },
  {
    href: '/admin/documents',
    icon: 'admin_panel_settings',
    label: 'Documents',
    roles: ['ADMIN'],
  },
  {
    href: '/admin/users',
    icon: 'group',
    label: 'Users',
    roles: ['ADMIN'],
  },
];

export default function SideNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-3.5 left-4 z-50 p-2 bg-[#f4f4f0] border border-graphite-border rounded-none text-[#030509] hover:bg-[#e9e8e4] md:hidden flex items-center justify-center active:scale-[0.98]"
        aria-label="Toggle Navigation"
      >
        <span className="material-symbols-outlined text-[20px]">{isOpen ? 'close' : 'menu'}</span>
      </button>

      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-xs z-35 md:hidden" />
      )}

      {/* Navigation Drawer */}
      <nav
        className={`fixed left-0 top-0 h-full flex flex-col py-8 z-40 bg-[#f4f4f0] border-r border-graphite-border w-64 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="px-6 mb-8 mt-6 md:mt-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#460002] flex items-center justify-center rounded-lg">
              <span
                className="material-symbols-outlined text-white text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_stories
              </span>
            </div>
            <div>
              <h1 className="font-label-md font-bold text-[#030509] leading-none">EduPub Manager</h1>
              <p className="font-label-sm text-[#76777b] uppercase tracking-widest mt-0.5">Scholarly Ed.</p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.filter((item) => user && item.roles.includes(user.role)).map((item) => {
            const active = item.href === '/admin' ? pathname === '/admin' : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 font-label-md transition-all rounded-none ${
                  active
                    ? 'bg-[#e9e8e4] text-[#030509] font-bold border-r-2 border-[#460002]'
                    : 'text-[#5d636f] hover:bg-[#e9e8e4] hover:text-[#030509]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Bottom: User + Logout */}
        <div className="px-3 pt-4 border-t border-graphite-border space-y-1">
          {/* Profile link */}
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 font-label-md text-[#5d636f] hover:bg-[#e9e8e4] hover:text-[#030509] transition-all rounded-none"
          >
            <div className="w-8 h-8 rounded-full bg-[#e9e8e4] border border-graphite-border flex items-center justify-center overflow-hidden shrink-0">
              {user?.avatarUrl ? (
                <Image
                  src={resolveUploadUrl(user.avatarUrl)}
                  alt={user.fullName || 'User'}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <span className="material-symbols-outlined text-[18px] text-[#76777b]">person</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-label-md text-[#030509] truncate">{user?.fullName}</p>
              <p className="font-label-sm text-[#76777b] truncate">{user?.role}</p>
            </div>
          </Link>
          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 font-label-md text-[#5d636f] hover:bg-[#e9e8e4] hover:text-[#030509] transition-all rounded-none"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Log out</span>
          </button>
        </div>
      </nav>
    </>
  );
}
