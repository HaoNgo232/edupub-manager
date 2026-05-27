import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';

interface MulterException {
  name?: string;
  code?: string;
  getStatus?: () => number;
  getResponse?: () => unknown;
}

@Catch()
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (this.isUnexpectedFieldException(exception)) {
      const response = host.switchToHttp().getResponse<Response>();
      response.status(400).json({
        statusCode: 400,
        message: 'File is required',
        error: 'Bad Request',
      });
      return;
    }

    if (this.isFileSizeException(exception)) {
      const response = host.switchToHttp().getResponse<Response>();
      response.status(400).json({
        statusCode: 400,
        message: 'File size exceeds the allowed limit',
        error: 'Bad Request',
      });
      return;
    }

    throw exception;
  }

  private isFileSizeException(exception: unknown): boolean {
    const multerException = exception as MulterException;

    return (
      (multerException?.name === 'MulterError' && multerException.code === 'LIMIT_FILE_SIZE') ||
      multerException?.getStatus?.() === 413
    );
  }

  private isUnexpectedFieldException(exception: unknown): boolean {
    const multerException = exception as MulterException;
    const response = multerException?.getResponse?.();
    const message =
      typeof response === 'object' && response !== null && 'message' in response
        ? (response as { message?: unknown }).message
        : undefined;

    return (
      (multerException?.name === 'MulterError' && multerException.code === 'LIMIT_UNEXPECTED_FILE') ||
      (multerException?.getStatus?.() === 400 && typeof message === 'string' && message.startsWith('Unexpected field'))
    );
  }
}
