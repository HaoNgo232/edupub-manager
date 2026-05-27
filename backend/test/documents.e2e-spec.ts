import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

interface TestOwnerResponse {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl: string | null;
}

interface TestDocumentResponse {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  gradeLevel: number;
  status: string;
  coverImageUrl: string | null;
  fileUrl: string | null;
  ownerId: string;
  owner?: TestOwnerResponse;
  createdAt: string;
  updatedAt: string;
}

interface TestErrorResponse {
  statusCode?: number;
  error?: string;
  message?: string | string[];
}

interface TestLoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

describe('DocumentsController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  let adminToken = '';
  let adminId = '';
  let user1Token = '';
  let user1Id = '';
  let user2Id = '';

  const adminCredentials = {
    email: 'admin-e2e@edupub.test',
    password: 'AdminPassword123',
    fullName: 'E2E Admin',
  };

  const user1Credentials = {
    email: 'user1-e2e@edupub.test',
    password: 'User1Password123',
    fullName: 'E2E User 1',
  };

  const user2Credentials = {
    email: 'user2-e2e@edupub.test',
    password: 'User2Password123',
    fullName: 'E2E User 2',
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
    // Clear databases
    await prisma.document.deleteMany({});
    await prisma.user.deleteMany({});

    // Create Admin
    const adminRes = await request(app.getHttpServer()).post('/auth/register').send(adminCredentials).expect(201);
    const adminBody = adminRes.body as TestLoginResponse;
    adminToken = adminBody.accessToken;
    adminId = adminBody.user.id;

    // Promote to Admin in DB
    await prisma.user.update({
      where: { id: adminId },
      data: { role: 'ADMIN' },
    });

    // Refresh token after role change by logging in
    const adminLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: adminCredentials.email,
        password: adminCredentials.password,
      })
      .expect(200);
    const adminLoginBody = adminLoginRes.body as { accessToken: string };
    adminToken = adminLoginBody.accessToken;

    // Create User 1
    const user1Res = await request(app.getHttpServer()).post('/auth/register').send(user1Credentials).expect(201);
    const user1Body = user1Res.body as TestLoginResponse;
    user1Token = user1Body.accessToken;
    user1Id = user1Body.user.id;

    // Create User 2
    const user2Res = await request(app.getHttpServer()).post('/auth/register').send(user2Credentials).expect(201);
    const user2Body = user2Res.body as TestLoginResponse;
    user2Id = user2Body.user.id;
  });

  afterAll(async () => {
    await prisma.document.deleteMany({});
    await prisma.user.deleteMany({});
    await app.close();
  });

  describe('POST /documents', () => {
    const validDocument = {
      title: 'Sách Toán lớp 10',
      description: 'Tài liệu ôn tập chương hàm số',
      subject: 'MATH',
      gradeLevel: 10,
      status: 'DRAFT',
      coverImageUrl: 'https://example.com/cover.png',
      fileUrl: 'https://example.com/document.pdf',
    };

    it('should successfully create a document for authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .post('/documents')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(validDocument)
        .expect(201);

      const body = response.body as TestDocumentResponse;
      expect(body).toHaveProperty('id');
      expect(body.title).toBe(validDocument.title);
      expect(body.description).toBe(validDocument.description);
      expect(body.subject).toBe(validDocument.subject);
      expect(body.gradeLevel).toBe(validDocument.gradeLevel);
      expect(body.status).toBe(validDocument.status);
      expect(body.coverImageUrl).toBe(validDocument.coverImageUrl);
      expect(body.fileUrl).toBe(validDocument.fileUrl);
      expect(body.ownerId).toBe(user1Id);
      expect(body.owner).toHaveProperty('id', user1Id);
      expect(body.owner?.email).toBe(user1Credentials.email);
      expect(body.owner?.fullName).toBe(user1Credentials.fullName);
      expect(body.owner?.role).toBe('USER');
      expect(body.owner).not.toHaveProperty('passwordHash');
    });

    it('should default status to DRAFT when status is omitted', async () => {
      const docWithoutStatus = { ...validDocument };
      delete (docWithoutStatus as Partial<typeof validDocument>).status;
      const response = await request(app.getHttpServer())
        .post('/documents')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(docWithoutStatus)
        .expect(201);

      const body = response.body as TestDocumentResponse;
      expect(body.status).toBe('DRAFT');
    });

    it('should accept portable upload paths for coverImageUrl and fileUrl', async () => {
      const uploadUrlDocument = {
        ...validDocument,
        coverImageUrl: '/uploads/images/1716720000000-a8f2-cover.png',
        fileUrl: '/uploads/files/1716720000000-a8f2-document.pdf',
      };

      const response = await request(app.getHttpServer())
        .post('/documents')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(uploadUrlDocument)
        .expect(201);

      const body = response.body as TestDocumentResponse;
      expect(body.coverImageUrl).toBe(uploadUrlDocument.coverImageUrl);
      expect(body.fileUrl).toBe(uploadUrlDocument.fileUrl);
    });

    it('should fail with 401 Unauthorized if token is missing', async () => {
      await request(app.getHttpServer()).post('/documents').send(validDocument).expect(401);
    });

    it('should fail with 400 Bad Request on invalid fields', async () => {
      const invalidDoc = {
        title: 'ab', // short
        subject: 'SCIENCE', // invalid enum
        gradeLevel: 13, // max is 12
      };

      const response = await request(app.getHttpServer())
        .post('/documents')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(invalidDoc)
        .expect(400);

      const body = response.body as TestErrorResponse;
      expect(body.error).toBe('Bad Request');
      expect(body.message).toBeInstanceOf(Array);
    });

    it('should ignore ownerId sent from client and override it with token user sub', async () => {
      const response = await request(app.getHttpServer())
        .post('/documents')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ ...validDocument, ownerId: user2Id })
        .expect(201);

      const body = response.body as TestDocumentResponse;
      expect(body.ownerId).toBe(user1Id);
    });
  });

  describe('GET /documents', () => {
    beforeEach(async () => {
      // Create user 1 documents
      await prisma.document.create({
        data: {
          title: 'Toán học đại số 10',
          description: 'Hàm số bậc hai',
          subject: 'MATH',
          gradeLevel: 10,
          status: 'PUBLISHED',
          ownerId: user1Id,
        },
      });
      await prisma.document.create({
        data: {
          title: 'Vật lý 11 cơ bản',
          description: 'Điện học đại cương',
          subject: 'PHYSICS',
          gradeLevel: 11,
          status: 'DRAFT',
          ownerId: user1Id,
        },
      });

      // Create user 2 documents
      await prisma.document.create({
        data: {
          title: 'Toán học hình học 10',
          description: 'Vectơ trong mặt phẳng',
          subject: 'MATH',
          gradeLevel: 10,
          status: 'PUBLISHED',
          ownerId: user2Id,
        },
      });
    });

    it('should return only own documents for regular user', async () => {
      const response = await request(app.getHttpServer())
        .get('/documents')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const body = response.body as {
        items: TestDocumentResponse[];
        meta: { total: number };
      };
      expect(body.items).toHaveLength(2);
      expect(body.meta.total).toBe(2);
      body.items.forEach((item: TestDocumentResponse) => {
        expect(item.ownerId).toBe(user1Id);
      });
    });

    it('should return only own documents for admin user on GET /documents (My Documents)', async () => {
      // Admin visits My Documents — should only see docs they own (0 in this test setup)
      const response = await request(app.getHttpServer())
        .get('/documents')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = response.body as {
        items: TestDocumentResponse[];
        meta: { total: number };
      };
      // Admin owns 0 documents in this test setup
      expect(body.meta.total).toBe(0);
      body.items.forEach((item: TestDocumentResponse) => {
        expect(item.ownerId).toBe(adminId);
      });
    });

    it('should return ALL system documents for admin user on GET /admin/documents', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/documents')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = response.body as {
        items: TestDocumentResponse[];
        meta: { total: number };
      };
      expect(body.items).toHaveLength(3);
      expect(body.meta.total).toBe(3);
    });

    it('should deny GET /admin/documents for regular user', async () => {
      await request(app.getHttpServer())
        .get('/admin/documents')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(403);
    });

    it('should filter by subject', async () => {
      const response = await request(app.getHttpServer())
        .get('/documents?subject=PHYSICS')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const body = response.body as { items: TestDocumentResponse[] };
      expect(body.items).toHaveLength(1);
      expect(body.items[0].subject).toBe('PHYSICS');
    });

    it('should filter by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/documents?status=DRAFT')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const body = response.body as { items: TestDocumentResponse[] };
      expect(body.items).toHaveLength(1);
      expect(body.items[0].status).toBe('DRAFT');
    });

    it('should filter by gradeLevel', async () => {
      const response = await request(app.getHttpServer())
        .get('/documents?gradeLevel=10')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const body = response.body as { items: TestDocumentResponse[] };
      expect(body.items).toHaveLength(1);
      expect(body.items[0].gradeLevel).toBe(10);
    });

    it('should search by q (title and description)', async () => {
      // Searching "đại số" in title or description
      const response = await request(app.getHttpServer())
        .get('/documents?q=đại số')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const body = response.body as { items: TestDocumentResponse[] };
      expect(body.items).toHaveLength(1);
      expect(body.items[0].title).toContain('Toán học đại số 10');
    });

    it('should paginate correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/documents?page=1&limit=1')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const body = response.body as {
        items: TestDocumentResponse[];
        meta: {
          limit: number;
          page: number;
          totalPages: number;
          hasNextPage: boolean;
          hasPreviousPage: boolean;
        };
      };
      expect(body.items).toHaveLength(1);
      expect(body.meta.limit).toBe(1);
      expect(body.meta.page).toBe(1);
      expect(body.meta.totalPages).toBe(2);
      expect(body.meta.hasNextPage).toBe(true);
      expect(body.meta.hasPreviousPage).toBe(false);
    });
  });

  describe('GET /documents/:id', () => {
    let user1DocId = '';
    let user2DocId = '';

    beforeEach(async () => {
      const doc1 = await prisma.document.create({
        data: {
          title: 'User 1 Document',
          subject: 'MATH',
          gradeLevel: 10,
          ownerId: user1Id,
        },
      });
      user1DocId = doc1.id;

      const doc2 = await prisma.document.create({
        data: {
          title: 'User 2 Document',
          subject: 'ENGLISH',
          gradeLevel: 12,
          ownerId: user2Id,
        },
      });
      user2DocId = doc2.id;
    });

    it('should return document detail for owner', async () => {
      const response = await request(app.getHttpServer())
        .get(`/documents/${user1DocId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const body = response.body as TestDocumentResponse;
      expect(body.id).toBe(user1DocId);
      expect(body.title).toBe('User 1 Document');
      expect(body.owner).toHaveProperty('id', user1Id);
    });

    it('should return document detail for admin even if they do not own it', async () => {
      const response = await request(app.getHttpServer())
        .get(`/documents/${user1DocId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = response.body as TestDocumentResponse;
      expect(body.id).toBe(user1DocId);
    });

    it('should return 404 for regular user trying to access other user document', async () => {
      const response = await request(app.getHttpServer())
        .get(`/documents/${user2DocId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(404);

      const body = response.body as TestErrorResponse;
      expect(body.message).toBe('Document not found');
    });

    it('should return 404 if document does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/documents/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(404);

      const body = response.body as TestErrorResponse;
      expect(body.message).toBe('Document not found');
    });
  });

  describe('PATCH /documents/:id', () => {
    let user1DocId = '';
    let user2DocId = '';

    beforeEach(async () => {
      const doc1 = await prisma.document.create({
        data: {
          title: 'Original Title 1',
          subject: 'MATH',
          gradeLevel: 10,
          ownerId: user1Id,
        },
      });
      user1DocId = doc1.id;

      const doc2 = await prisma.document.create({
        data: {
          title: 'Original Title 2',
          subject: 'ENGLISH',
          gradeLevel: 12,
          ownerId: user2Id,
        },
      });
      user2DocId = doc2.id;
    });

    it('should successfully update document for owner', async () => {
      const payload = { title: 'Updated Title 1', gradeLevel: 11 };
      const response = await request(app.getHttpServer())
        .patch(`/documents/${user1DocId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(payload)
        .expect(200);

      const body = response.body as TestDocumentResponse;
      expect(body.title).toBe(payload.title);
      expect(body.gradeLevel).toBe(payload.gradeLevel);

      const dbDoc = await prisma.document.findUnique({
        where: { id: user1DocId },
      });
      expect(dbDoc?.title).toBe(payload.title);
    });

    it('should accept portable upload paths and allow clearing them on update', async () => {
      const uploadUrls = {
        coverImageUrl: '/uploads/images/1716720000000-a8f2-cover.png',
        fileUrl: '/uploads/files/1716720000000-a8f2-document.pdf',
      };

      const response = await request(app.getHttpServer())
        .patch(`/documents/${user1DocId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(uploadUrls)
        .expect(200);

      const body = response.body as TestDocumentResponse;
      expect(body.coverImageUrl).toBe(uploadUrls.coverImageUrl);
      expect(body.fileUrl).toBe(uploadUrls.fileUrl);

      const clearResponse = await request(app.getHttpServer())
        .patch(`/documents/${user1DocId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ coverImageUrl: '', fileUrl: '' })
        .expect(200);

      const clearBody = clearResponse.body as TestDocumentResponse;
      expect(clearBody.coverImageUrl).toBeNull();
      expect(clearBody.fileUrl).toBeNull();
    });

    it('should successfully update any document for admin', async () => {
      const payload = { title: 'Admin Updated Title' };
      const response = await request(app.getHttpServer())
        .patch(`/documents/${user1DocId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload)
        .expect(200);

      const body = response.body as TestDocumentResponse;
      expect(body.title).toBe(payload.title);
    });

    it('should return 404 for regular user trying to update other user document', async () => {
      const payload = { title: 'Hacked' };
      await request(app.getHttpServer())
        .patch(`/documents/${user2DocId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(payload)
        .expect(404);
    });

    it('should ignore read-only fields (id, ownerId, createdAt, updatedAt)', async () => {
      const dbDocBefore = await prisma.document.findUnique({
        where: { id: user1DocId },
      });

      const response = await request(app.getHttpServer())
        .patch(`/documents/${user1DocId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          id: 'new-id-hacked',
          ownerId: user2Id,
          createdAt: new Date(2000, 1, 1).toISOString(),
          updatedAt: new Date(2000, 1, 1).toISOString(),
          title: 'Valid Update',
        })
        .expect(200);

      const body = response.body as TestDocumentResponse;
      expect(body.id).toBe(user1DocId);
      expect(body.ownerId).toBe(user1Id);
      expect(body.title).toBe('Valid Update');

      const dbDocAfter = await prisma.document.findUnique({
        where: { id: user1DocId },
      });
      expect(dbDocAfter?.createdAt.toISOString()).toBe(dbDocBefore?.createdAt.toISOString());
    });
  });

  describe('DELETE /documents/:id', () => {
    let user1DocId = '';
    let user2DocId = '';

    beforeEach(async () => {
      const doc1 = await prisma.document.create({
        data: {
          title: 'Doc to Delete 1',
          subject: 'MATH',
          gradeLevel: 10,
          ownerId: user1Id,
        },
      });
      user1DocId = doc1.id;

      const doc2 = await prisma.document.create({
        data: {
          title: 'Doc to Delete 2',
          subject: 'ENGLISH',
          gradeLevel: 12,
          ownerId: user2Id,
        },
      });
      user2DocId = doc2.id;
    });

    it('should delete document for owner', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/documents/${user1DocId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Document deleted successfully',
      });

      const dbDoc = await prisma.document.findUnique({
        where: { id: user1DocId },
      });
      expect(dbDoc).toBeNull();
    });

    it('should delete any document for admin', async () => {
      await request(app.getHttpServer())
        .delete(`/documents/${user1DocId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const dbDoc = await prisma.document.findUnique({
        where: { id: user1DocId },
      });
      expect(dbDoc).toBeNull();
    });

    it('should return 404 for regular user trying to delete other user document', async () => {
      await request(app.getHttpServer())
        .delete(`/documents/${user2DocId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(404);

      const dbDoc = await prisma.document.findUnique({
        where: { id: user2DocId },
      });
      expect(dbDoc).not.toBeNull();
    });
  });
});
