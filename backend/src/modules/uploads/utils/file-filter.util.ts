import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import { BLOCKED_EXTENSIONS } from '../constants/upload.constants';
import { UploadedFile } from '../interfaces/uploaded-file.interface';

export function createMimeTypeFilter(allowedMimeTypes: Set<string>) {
  return (_request: unknown, file: UploadedFile, callback: (error: Error | null, acceptFile: boolean) => void) => {
    const extension = extname(file.originalname).toLowerCase();
    if (BLOCKED_EXTENSIONS.has(extension) || !allowedMimeTypes.has(file.mimetype)) {
      callback(new BadRequestException('Invalid file type'), false);
      return;
    }

    callback(null, true);
  };
}
