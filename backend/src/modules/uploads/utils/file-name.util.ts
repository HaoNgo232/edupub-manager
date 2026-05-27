import { extname, parse } from 'path';
import { randomBytes } from 'crypto';

export function sanitizeOriginalName(originalName: string): string {
  const parsed = parse(originalName);
  const extension = extname(originalName).toLowerCase();
  const safeBase = parsed.name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  return `${safeBase || 'file'}${extension}`;
}

export function generateSafeFileName(originalName: string): string {
  const safeOriginalName = sanitizeOriginalName(originalName);
  const random = randomBytes(4).toString('hex');

  return `${Date.now()}-${random}-${safeOriginalName}`;
}
