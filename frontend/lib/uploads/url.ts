const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function resolveUploadUrl(value: string): string {
  if (!value.startsWith('/uploads/')) return value;
  return `${API_BASE_URL}${value}`;
}
