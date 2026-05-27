import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UploadedFile as UploadedFileDecorator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Request, Response } from 'express';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  ALLOWED_IMAGE_MIME_TYPES,
  DOCUMENT_MAX_FILE_SIZE,
  IMAGE_MAX_FILE_SIZE,
  UPLOADS_FILE_DIR,
  UPLOADS_IMAGE_DIR,
} from './constants/upload.constants';
import { MulterExceptionFilter } from './filters/multer-exception.filter';
import type { UploadedFile } from './interfaces/uploaded-file.interface';
import { UploadsService } from './uploads.service';
import type { UploadResponse } from './uploads.service';
import { createMimeTypeFilter } from './utils/file-filter.util';
import { generateSafeFileName } from './utils/file-name.util';

@Controller('uploads')
@UseFilters(MulterExceptionFilter)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_request, _file, callback) => {
          mkdirSync(UPLOADS_IMAGE_DIR, { recursive: true });
          callback(null, UPLOADS_IMAGE_DIR);
        },
        filename: (_request, file: UploadedFile, callback) => {
          callback(null, generateSafeFileName(file.originalname));
        },
      }),
      fileFilter: createMimeTypeFilter(ALLOWED_IMAGE_MIME_TYPES),
      limits: {
        fileSize: IMAGE_MAX_FILE_SIZE,
        files: 1,
      },
    }),
  )
  uploadImage(@Req() request: Request, @UploadedFileDecorator() file?: UploadedFile): UploadResponse {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.uploadsService.buildImageResponse(file, this.getBaseUrl(request));
  }

  @Post('file')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_request, _file, callback) => {
          mkdirSync(UPLOADS_FILE_DIR, { recursive: true });
          callback(null, UPLOADS_FILE_DIR);
        },
        filename: (_request, file: UploadedFile, callback) => {
          callback(null, generateSafeFileName(file.originalname));
        },
      }),
      fileFilter: createMimeTypeFilter(ALLOWED_DOCUMENT_MIME_TYPES),
      limits: {
        fileSize: DOCUMENT_MAX_FILE_SIZE,
        files: 1,
      },
    }),
  )
  uploadFile(@Req() request: Request, @UploadedFileDecorator() file?: UploadedFile): UploadResponse {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.uploadsService.buildFileResponse(file, this.getBaseUrl(request));
  }

  @Get('images/:filename')
  serveImage(@Param('filename') filename: string, @Res() response: Response) {
    return this.serveUpload(UPLOADS_IMAGE_DIR, filename, response);
  }

  @Get('files/:filename')
  serveFile(@Param('filename') filename: string, @Res() response: Response) {
    return this.serveUpload(UPLOADS_FILE_DIR, filename, response);
  }

  private serveUpload(root: string, filename: string, response: Response) {
    if (!this.isSafeFilename(filename)) {
      throw new NotFoundException();
    }

    const filePath = join(root, filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException();
    }

    return response.sendFile(filename, { root });
  }

  private isSafeFilename(filename: string): boolean {
    return /^[a-zA-Z0-9._-]+$/.test(filename) && !filename.includes('..');
  }

  private getBaseUrl(request: Request): string {
    return `${request.protocol}://${request.get('host')}`;
  }
}
