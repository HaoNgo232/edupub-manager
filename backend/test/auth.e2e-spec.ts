import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

interface TestResponse {
  accessToken?: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
  };
  statusCode?: number;
  error?: string;
  message?: string | string[];
}

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

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
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await app.close();
  });

  describe('POST /auth/register', () => {
    const validUser = {
      email: 'test@edupub.test',
      password: 'Password123',
      fullName: 'Test User',
    };

    it('should successfully register a new user and return user info (without passwordHash) and accessToken', async () => {
      const response = await request(app.getHttpServer()).post('/auth/register').send(validUser).expect(201);

      const body = response.body as TestResponse;
      expect(body).toHaveProperty('accessToken');
      expect(body).toHaveProperty('user');
      expect(body.user).toBeDefined();
      if (body.user) {
        expect(body.user).toHaveProperty('id');
        expect(body.user.email).toBe(validUser.email);
        expect(body.user.fullName).toBe(validUser.fullName);
        expect(body.user.role).toBe('USER');
        expect(body.user.avatarUrl).toBeNull();
        expect(body.user).not.toHaveProperty('passwordHash');
        expect(body.user).not.toHaveProperty('password');
        expect(body.user).toHaveProperty('createdAt');
        expect(body.user).toHaveProperty('updatedAt');
      }
    });

    it('should ignore role and create user with default role USER if client sends role', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...validUser,
          role: 'ADMIN',
        })
        .expect(201);

      const body = response.body as TestResponse;
      expect(body.user?.role).toBe('USER');
    });

    it('should fail with 400 Bad Request on validation errors (invalid email, short password, short fullName)', async () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'short', // less than 6 characters
        fullName: 'a', // less than 2 characters
      };

      const response = await request(app.getHttpServer()).post('/auth/register').send(invalidData).expect(400);

      const body = response.body as TestResponse;
      expect(body).toHaveProperty('statusCode', 400);
      expect(body).toHaveProperty('error', 'Bad Request');
      expect(body.message).toBeInstanceOf(Array);
      if (Array.isArray(body.message)) {
        expect(body.message.length).toBeGreaterThanOrEqual(3);
      }
    });

    it('should fail with 409 Conflict if registration email already exists', async () => {
      // First registration
      await request(app.getHttpServer()).post('/auth/register').send(validUser).expect(201);

      // Duplicate registration
      const response = await request(app.getHttpServer()).post('/auth/register').send(validUser).expect(409);

      const body = response.body as TestResponse;
      expect(body).toEqual({
        statusCode: 409,
        error: 'Conflict',
        message: 'Email already exists',
      });
    });
  });

  describe('POST /auth/login', () => {
    const testUser = {
      email: 'login@edupub.test',
      password: 'LoginPassword123',
      fullName: 'Login User',
    };

    beforeEach(async () => {
      // Seed a user for login testing
      await request(app.getHttpServer()).post('/auth/register').send(testUser).expect(201);
    });

    it('should successfully log in and return user info (without passwordHash) and accessToken', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      const body = response.body as TestResponse;
      expect(body).toHaveProperty('accessToken');
      expect(body).toHaveProperty('user');
      expect(body.user).toBeDefined();
      if (body.user) {
        expect(body.user).toHaveProperty('id');
        expect(body.user.email).toBe(testUser.email);
        expect(body.user.fullName).toBe(testUser.fullName);
        expect(body.user.role).toBe('USER');
        expect(body.user).not.toHaveProperty('passwordHash');
        expect(body.user).toHaveProperty('createdAt');
        expect(body.user).toHaveProperty('updatedAt');
      }
    });

    it('should fail with 401 Unauthorized if password is incorrect', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword',
        })
        .expect(401);

      const body = response.body as TestResponse;
      expect(body).toEqual({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    });

    it('should fail with 401 Unauthorized if email does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@edupub.test',
          password: testUser.password,
        })
        .expect(401);

      const body = response.body as TestResponse;
      expect(body).toEqual({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    });

    it('should fail with 400 Bad Request on validation errors (invalid email)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: 'some-password',
        })
        .expect(400);

      const body = response.body as TestResponse;
      expect(body).toHaveProperty('statusCode', 400);
      expect(body).toHaveProperty('error', 'Bad Request');
      expect(body.message).toBeInstanceOf(Array);
    });
  });

  describe('GET /auth/me', () => {
    const testUser = {
      email: 'me@edupub.test',
      password: 'MePassword123',
      fullName: 'Me User',
    };
    let accessToken = '';

    beforeEach(async () => {
      const registerRes = await request(app.getHttpServer()).post('/auth/register').send(testUser).expect(201);
      const registerBody = registerRes.body as TestResponse;
      accessToken = registerBody.accessToken ?? '';
    });

    it('should successfully return the current user profile when authorized', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const body = response.body as TestResponse;
      expect(body).toHaveProperty('id');
      expect(body.email).toBe(testUser.email);
      expect(body.fullName).toBe(testUser.fullName);
      expect(body.role).toBe('USER');
      expect(body).not.toHaveProperty('passwordHash');
    });

    it('should fail with 401 Unauthorized if token is missing', async () => {
      const response = await request(app.getHttpServer()).get('/auth/me').expect(401);

      const body = response.body as TestResponse;
      expect(body).toEqual({
        statusCode: 401,
        message: 'Unauthorized',
      });
    });

    it('should fail with 401 Unauthorized if token is malformed', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      const body = response.body as TestResponse;
      expect(body).toEqual({
        statusCode: 401,
        message: 'Unauthorized',
      });
    });
  });
});
