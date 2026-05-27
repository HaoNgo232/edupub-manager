import { join } from 'path';

export const UPLOADS_ROOT = join(process.cwd(), 'uploads');
export const UPLOADS_IMAGE_DIR = join(UPLOADS_ROOT, 'images');
export const UPLOADS_FILE_DIR = join(UPLOADS_ROOT, 'files');

export const IMAGE_UPLOAD_PATH = '/uploads/images';
export const FILE_UPLOAD_PATH = '/uploads/files';

export const IMAGE_MAX_FILE_SIZE = 20 * 1024 * 1024;
export const DOCUMENT_MAX_FILE_SIZE = 20 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export const ALLOWED_DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
]);

export const BLOCKED_EXTENSIONS = new Set(['.exe', '.sh', '.bat', '.js', '.html']);
