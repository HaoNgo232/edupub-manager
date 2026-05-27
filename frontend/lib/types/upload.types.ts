export interface UploadResponse {
  url: string;
  path: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface UploadState {
  isUploading: boolean;
  error: string | null;
}
