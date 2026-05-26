type GetToken = () => string | null;
type OnUnauthorized = () => void;

let getToken: GetToken | null = null;
let onUnauthorized: OnUnauthorized | null = null;

export interface ApiClientConfig {
  getToken?: GetToken;
  onUnauthorized?: OnUnauthorized;
}

export interface ApiFetchOptions extends RequestInit {
  skipAuthRedirect?: boolean;
}

export class ApiError extends Error {
  statusCode: number;
  errors: string[];

  constructor(statusCode: number, errors: string[]) {
    super(errors[0] || 'API Error');
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export function configureApiClient(config: ApiClientConfig): void {
  if (config.getToken) getToken = config.getToken;
  if (config.onUnauthorized) onUnauthorized = config.onUnauthorized;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiFetch<T>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const { skipAuthRedirect = false, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);

  if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getToken?.();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    let errorMessages: string[] = [];
    const statusCode = response.status;

    try {
      const errorData = await response.json();
      if (errorData && typeof errorData === 'object') {
        if (Array.isArray(errorData.message)) {
          errorMessages = errorData.message;
        } else if (typeof errorData.message === 'string') {
          errorMessages = [errorData.message];
        } else if (typeof errorData.error === 'string') {
          errorMessages = [errorData.error];
        }
      }
    } catch {
      // ignore JSON parse error
    }

    if (errorMessages.length === 0) {
      errorMessages = [response.statusText || `Request failed with status ${statusCode}`];
    }

    if (statusCode === 401 && !skipAuthRedirect) {
      onUnauthorized?.();
    }

    throw new ApiError(statusCode, errorMessages);
  }

  if (response.status === 204) {
    return {} as T;
  }

  try {
    return await response.json();
  } catch {
    return {} as T;
  }
}
