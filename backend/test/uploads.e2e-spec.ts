import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

interface TestLoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

interface UploadResponse {
  url: string;
  path: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}

interface DocumentResponse {
  coverImageUrl: string | null;
  fileUrl: string | null;
}

describe('UploadsController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let userToken = '';
  const uploadsRoot = join(process.cwd(), 'uploads');

  const credentials = {
    email: 'uploads-e2e@edupub.test',
    password: 'UploadPassword123',
    fullName: 'Uploads E2E User',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await prisma.document.deleteMany({});
    await prisma.user.deleteMany({});
    if (existsSync(uploadsRoot)) {
      rmSync(uploadsRoot, { recursive: true, force: true });
    }

    const registerRes = await request(app.getHttpServer()).post('/auth/register').send(credentials).expect(201);
    const body = registerRes.body as TestLoginResponse;
    userToken = body.accessToken;
  });

  afterAll(async () => {
    await prisma.document.deleteMany({});
    await prisma.user.deleteMany({});
    if (existsSync(uploadsRoot)) {
      rmSync(uploadsRoot, { recursive: true, force: true });
    }
    await app.close();
  });

  describe('POST /uploads/image', () => {
    it('should require JWT authentication', async () => {
      await request(app.getHttpServer())
        .post('/uploads/image')
        .attach('file', Buffer.from('fake image'), {
          filename: 'cover.png',
          contentType: 'image/png',
        })
        .expect(401);
    });

    it('should upload a valid image, sanitize the filename, and serve it publicly', async () => {
      const response = await request(app.getHttpServer())
        .post('/uploads/image')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', Buffer.from('fake png bytes'), {
          filename: '../../cover name!.png',
          contentType: 'image/png',
        })
        .expect(201);

      const body = response.body as UploadResponse;
      expect(body.path).toMatch(/^\/uploads\/images\/\d+-[a-f0-9]{8}-cover-name\.png$/);
      expect(body.url).toContain(body.path);
      expect(body.filename).toBe(body.path.split('/').pop());
      expect(body.filename).not.toContain('..');
      expect(body.filename).not.toContain('/');
      expect(body.originalName).toBe('cover name!.png');
      expect(body.mimeType).toBe('image/png');
      expect(body.size).toBe(Buffer.byteLength('fake png bytes'));

      await request(app.getHttpServer()).get(body.path).expect(200);
    });

    it('should reject missing file', async () => {
      const response = await request(app.getHttpServer())
        .post('/uploads/image')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body).toEqual({
        statusCode: 400,
        message: 'File is required',
        error: 'Bad Request',
      });
    });

    it('should reject files sent with an unexpected field name as missing file', async () => {
      const response = await request(app.getHttpServer())
        .post('/uploads/image')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('other', Buffer.from('fake image'), {
          filename: 'cover.png',
          contentType: 'image/png',
        })
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body).toEqual({
        statusCode: 400,
        message: 'File is required',
        error: 'Bad Request',
      });
    });

    it('should reject invalid image MIME types', async () => {
      const response = await request(app.getHttpServer())
        .post('/uploads/image')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', Buffer.from('not an image'), {
          filename: 'document.pdf',
          contentType: 'application/pdf',
        })
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body).toEqual({
        statusCode: 400,
        message: 'Invalid file type',
        error: 'Bad Request',
      });
    });

    it('should reject images larger than the allowed limit', async () => {
      const largerThanTwoMb = Buffer.alloc(2 * 1024 * 1024 + 1, 'a');

      const response = await request(app.getHttpServer())
        .post('/uploads/image')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', largerThanTwoMb, {
          filename: 'large.png',
          contentType: 'image/png',
        })
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body).toEqual({
        statusCode: 400,
        message: 'File size exceeds the allowed limit',
        error: 'Bad Request',
      });
    });
  });

  describe('POST /uploads/file', () => {
    it('should upload a valid document file and serve it publicly', async () => {
      const response = await request(app.getHttpServer())
        .post('/uploads/file')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', Buffer.from('%PDF-1.4 fake pdf'), {
          filename: 'document.pdf',
          contentType: 'application/pdf',
        })
        .expect(201);

      const body = response.body as UploadResponse;
      expect(body.path).toMatch(/^\/uploads\/files\/\d+-[a-f0-9]{8}-document\.pdf$/);
      expect(body.url).toContain(body.path);
      expect(body.originalName).toBe('document.pdf');
      expect(body.mimeType).toBe('application/pdf');

      await request(app.getHttpServer()).get(body.path).expect(200);
    });

    it('should reject executable and script files', async () => {
      const response = await request(app.getHttpServer())
        .post('/uploads/file')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', Buffer.from('echo unsafe'), {
          filename: 'run.sh',
          contentType: 'application/x-sh',
        })
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body).toEqual({
        statusCode: 400,
        message: 'Invalid file type',
        error: 'Bad Request',
      });
    });

    it('should reject files larger than the allowed limit', async () => {
      const elevenMb = Buffer.alloc(10 * 1024 * 1024 + 1, 'a');

      const response = await request(app.getHttpServer())
        .post('/uploads/file')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', elevenMb, {
          filename: 'large.pdf',
          contentType: 'application/pdf',
        })
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body).toEqual({
        statusCode: 400,
        message: 'File size exceeds the allowed limit',
        error: 'Bad Request',
      });
    });

    it('should allow document creation with uploaded coverImageUrl and fileUrl', async () => {
      const imageResponse = await request(app.getHttpServer())
        .post('/uploads/image')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', Buffer.from('fake image'), {
          filename: 'cover.webp',
          contentType: 'image/webp',
        })
        .expect(201);
      const imageBody = imageResponse.body as UploadResponse;

      const fileResponse = await request(app.getHttpServer())
        .post('/uploads/file')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', Buffer.from('%PDF-1.4 fake pdf'), {
          filename: 'lesson.pdf',
          contentType: 'application/pdf',
        })
        .expect(201);
      const fileBody = fileResponse.body as UploadResponse;

      const documentResponse = await request(app.getHttpServer())
        .post('/documents')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Uploaded File Document',
          subject: 'MATH',
          gradeLevel: 10,
          coverImageUrl: imageBody.url,
          fileUrl: fileBody.url,
        })
        .expect(201);

      const documentBody = documentResponse.body as DocumentResponse;
      expect(documentBody.coverImageUrl).toBe(imageBody.url);
      expect(documentBody.fileUrl).toBe(fileBody.url);
    });
  });
});
