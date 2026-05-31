'use client';

import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { registerAuthInterceptor } from '../lib/http/auth-interceptor';

export function Providers({ children }: { children: React.ReactNode }) {
  registerAuthInterceptor();

  return <AuthProvider>{children}</AuthProvider>;
}
