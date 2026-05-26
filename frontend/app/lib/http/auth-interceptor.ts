import { configureApiClient } from '../../../lib/http/client';

let registered = false;

export function registerAuthInterceptor(): void {
  if (registered) return;
  registered = true;

  configureApiClient({
    getToken: () => {
      if (typeof localStorage === 'undefined') return null;
      return localStorage.getItem('accessToken');
    },
    onUnauthorized: () => {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('accessToken');
      }

      if (
        typeof window !== 'undefined' &&
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/login';
      }
    },
  });
}
