import { apiFetch } from '../http/client';
import type { UploadResponse } from '../types/upload.types';

function buildUploadFormData(file: File): FormData {
  const formData = new FormData();
  formData.append('file', file);
  return formData;
}

export async function uploadImage(file: File): Promise<UploadResponse> {
  return apiFetch<UploadResponse>('/uploads/image', {
    method: 'POST',
    body: buildUploadFormData(file),
  });
}

export async function uploadDocumentFile(file: File): Promise<UploadResponse> {
  return apiFetch<UploadResponse>('/uploads/file', {
    method: 'POST',
    body: buildUploadFormData(file),
  });
}
