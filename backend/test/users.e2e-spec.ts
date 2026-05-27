import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

interface TestUserResponse {
  id?: string;
  email?: string;
  fullName?: string;
  role?: string;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  passwordHash?: string;
}

interface TestErrorResponse {
  statusCode?: number;
  error?: string;
  message?: string | string[];
}

interface TestRegisterResponse {
  accessToken?: string;
  user?: TestUserResponse;
}

describe('UsersController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken = '';
  let testUserId = '';

  const testUser = {
    email: 'profile@edupub.test',
    password: 'ProfilePassword123',
    fullName: 'Profile User',
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
    // Clear user table to ensure clean database state before each test
    await prisma.user.deleteMany({});

    // Register a user and save their token/id
    const registerRes = await request(app.getHttpServer()).post('/auth/register').send(testUser).expect(201);

    const registerBody = registerRes.body as TestRegisterResponse;
    accessToken = registerBody.accessToken ?? '';
    testUserId = registerBody.user?.id ?? '';
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await app.close();
  });

  describe('GET /users/me', () => {
    it('should successfully return the current user profile when authorized', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const body = response.body as TestUserResponse;
      expect(body).toHaveProperty('id', testUserId);
      expect(body.email).toBe(testUser.email);
      expect(body.fullName).toBe(testUser.fullName);
      expect(body.role).toBe('USER');
      expect(body.avatarUrl).toBeNull();
      expect(body).not.toHaveProperty('passwordHash');
      expect(body).toHaveProperty('createdAt');
      expect(body).toHaveProperty('updatedAt');
    });

    it('should fail with 401 Unauthorized if token is missing', async () => {
      const response = await request(app.getHttpServer()).get('/users/me').expect(401);

      const body = response.body as TestErrorResponse;
      expect(body).toEqual({
        statusCode: 401,
        message: 'Unauthorized',
      });
    });

    it('should fail with 401 Unauthorized if token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      const body = response.body as TestErrorResponse;
      expect(body).toEqual({
        statusCode: 401,
        message: 'Unauthorized',
      });
    });
  });

  describe('PATCH /users/me', () => {
    const updatePayload = {
      fullName: 'Updated Profile User',
      avatarUrl: 'https://example.com/avatar.png',
    };

    it('should successfully update the user profile and return the updated user (without passwordHash)', async () => {
      const response = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatePayload)
        .expect(200);

      const body = response.body as TestUserResponse;
      expect(body).toHaveProperty('id', testUserId);
      expect(body.email).toBe(testUser.email);
      expect(body.fullName).toBe(updatePayload.fullName);
      expect(body.avatarUrl).toBe(updatePayload.avatarUrl);
      expect(body.role).toBe('USER');
      expect(body).not.toHaveProperty('passwordHash');
      expect(body).toHaveProperty('createdAt');
      expect(body).toHaveProperty('updatedAt');

      // Verify DB update
      const dbUser = await prisma.user.findUnique({
        where: { id: testUserId },
      });
      expect(dbUser?.fullName).toBe(updatePayload.fullName);
      expect(dbUser?.avatarUrl).toBe(updatePayload.avatarUrl);
    });

    it('should ignore read-only fields (id, email, role, passwordHash, createdAt, updatedAt) and not update them', async () => {
      const dbUserBefore = await prisma.user.findUnique({
        where: { id: testUserId },
      });

      const maliciousPayload = {
        id: 'hacked-id',
        email: 'hacked@edupub.test',
        role: 'ADMIN',
        passwordHash: 'hackedpasswordhash',
        createdAt: new Date(2000, 1, 1).toISOString(),
        updatedAt: new Date(2000, 1, 1).toISOString(),
        fullName: 'New Name',
      };

      const response = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(maliciousPayload)
        .expect(200);

      const body = response.body as TestUserResponse;
      expect(body.id).toBe(testUserId);
      expect(body.email).toBe(testUser.email);
      expect(body.role).toBe('USER');
      expect(body.fullName).toBe('New Name');
      expect(body).not.toHaveProperty('passwordHash');

      // Verify DB values
      const dbUserAfter = await prisma.user.findUnique({
        where: { id: testUserId },
      });
      expect(dbUserAfter?.id).toBe(testUserId);
      expect(dbUserAfter?.email).toBe(testUser.email);
      expect(dbUserAfter?.role).toBe('USER');
      expect(dbUserAfter?.passwordHash).toBe(dbUserBefore?.passwordHash);
      expect(dbUserAfter?.createdAt.toISOString()).toBe(dbUserBefore?.createdAt.toISOString());
    });

    it('should fail with 400 Bad Request on validation errors (invalid avatarUrl format, short fullName)', async () => {
      const invalidPayload = {
        fullName: 'a', // too short
        avatarUrl: 'not-a-url', // not a valid URL
      };

      const response = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidPayload)
        .expect(400);

      const body = response.body as TestErrorResponse;
      expect(body).toHaveProperty('statusCode', 400);
      expect(body).toHaveProperty('error', 'Bad Request');
      expect(body.message).toBeInstanceOf(Array);
      if (Array.isArray(body.message)) {
        expect(body.message.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('should fail with 401 Unauthorized if token is missing', async () => {
      const response = await request(app.getHttpServer()).patch('/users/me').send(updatePayload).expect(401);

      const body = response.body as TestErrorResponse;
      expect(body).toEqual({
        statusCode: 401,
        message: 'Unauthorized',
      });
    });
  });
});
