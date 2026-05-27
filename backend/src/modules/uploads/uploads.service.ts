import { Injectable, OnModuleInit } from '@nestjs/common';
import { mkdirSync } from 'fs';
import { FILE_UPLOAD_PATH, IMAGE_UPLOAD_PATH, UPLOADS_FILE_DIR, UPLOADS_IMAGE_DIR } from './constants/upload.constants';
import { UploadedFile } from './interfaces/uploaded-file.interface';

export interface UploadResponse {
  url: string;
  path: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

@Injectable()
export class UploadsService implements OnModuleInit {
  onModuleInit() {
    this.ensureUploadDirectories();
  }

  ensureUploadDirectories() {
    mkdirSync(UPLOADS_IMAGE_DIR, { recursive: true });
    mkdirSync(UPLOADS_FILE_DIR, { recursive: true });
  }

  buildImageResponse(file: UploadedFile, baseUrl: string): UploadResponse {
    return this.buildResponse(file, IMAGE_UPLOAD_PATH, baseUrl);
  }

  buildFileResponse(file: UploadedFile, baseUrl: string): UploadResponse {
    return this.buildResponse(file, FILE_UPLOAD_PATH, baseUrl);
  }

  private buildResponse(file: UploadedFile, publicPath: string, baseUrl: string): UploadResponse {
    const path = `${publicPath}/${file.filename}`;

    return {
      url: `${baseUrl}${path}`,
      path,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }
}
