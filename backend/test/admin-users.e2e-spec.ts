import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

interface TestUserResponse {
  id?: string;
  email?: string;
  fullName?: string;
  role?: string;
  avatarUrl?: string | null;
  documentsCount?: number;
  recentDocuments?: any[];
  createdAt?: string;
  updatedAt?: string;
  passwordHash?: string;
}

describe('AdminUsersController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminToken = '';
  let userToken = '';
  let adminUserId = '';
  let normalUserId = '';

  const adminUser = {
    email: 'admin-e2e@edupub.test',
    password: 'AdminPassword123',
    fullName: 'Admin E2E User',
  };

  const normalUser = {
    email: 'user-e2e@edupub.test',
    password: 'UserPassword123',
    fullName: 'User E2E User',
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
    // Clear user table
    await prisma.user.deleteMany({});

    // Create admin user in database manually to assign ADMIN role
    const saltRounds = 10;
    const adminPasswordHash = await bcrypt.hash(adminUser.password, saltRounds);
    const dbAdmin = await prisma.user.create({
      data: {
        email: adminUser.email,
        passwordHash: adminPasswordHash,
        fullName: adminUser.fullName,
        role: Role.ADMIN,
      },
    });
    adminUserId = dbAdmin.id;

    // Login admin to get token
    const adminLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminUser.email, password: adminUser.password })
      .expect(200);
    adminToken = (adminLoginRes.body as { accessToken: string }).accessToken;

    // Register a normal user and get token
    const userRegisterRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(normalUser)
      .expect(201);
    userToken = (userRegisterRes.body as { accessToken: string }).accessToken;
    normalUserId = (userRegisterRes.body as { user: TestUserResponse }).user.id ?? '';
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await app.close();
  });

  describe('GET /admin/users', () => {
    it('should successfully return the user list for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = response.body as { items: TestUserResponse[]; meta: any };
      expect(body.items.length).toBeGreaterThanOrEqual(2);
      expect(body.items[0]).toHaveProperty('documentsCount');
      expect(body.items[0]).not.toHaveProperty('passwordHash');
    });

    it('should block non-admin users with 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should fail with 401 Unauthorized if token is missing', async () => {
      await request(app.getHttpServer()).get('/admin/users').expect(401);
    });

    it('should search users by email/fullName', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/users?q=Admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = response.body as { items: TestUserResponse[] };
      expect(
        body.items.every((u) => u.fullName?.includes('Admin') || u.email?.includes('Admin')),
      ).toBe(true);
    });

    it('should filter users by role', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/users?role=ADMIN')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = response.body as { items: TestUserResponse[] };
      expect(body.items.every((u) => u.role === 'ADMIN')).toBe(true);
    });
  });

  describe('GET /admin/users/:id', () => {
    it('should return user details with recent documents', async () => {
      // Create some documents for normal user
      await prisma.document.create({
        data: {
          title: 'Toán Học 10',
          subject: 'MATH',
          gradeLevel: 10,
          ownerId: normalUserId,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/admin/users/${normalUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = response.body as TestUserResponse;
      expect(body.id).toBe(normalUserId);
      expect(body.documentsCount).toBe(1);
      expect(body.recentDocuments).toHaveLength(1);
      expect((body.recentDocuments?.[0] as Record<string, any>).title).toBe('Toán Học 10');
      expect(body).not.toHaveProperty('passwordHash');
    });

    it("should return 404 Not Found if user doesn't exist", async () => {
      await request(app.getHttpServer())
        .get('/admin/users/df3566d8-471a-402b-804d-e805edae4b2c')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('POST /admin/users', () => {
    it('should allow admin to create a new user', async () => {
      const newPayload = {
        email: 'created-by-admin@edupub.test',
        password: 'CreatedPassword123',
        fullName: 'Created Admin User',
        role: Role.ADMIN,
      };

      const response = await request(app.getHttpServer())
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newPayload)
        .expect(201);

      const body = response.body as TestUserResponse;
      expect(body.email).toBe(newPayload.email);
      expect(body.fullName).toBe(newPayload.fullName);
      expect(body.role).toBe('ADMIN');
      expect(body.documentsCount).toBe(0);
      expect(body).not.toHaveProperty('passwordHash');
    });

    it('should reject email duplicates with 409 Conflict', async () => {
      const payload = {
        email: normalUser.email,
        password: 'SomePassword123',
        fullName: 'Duplicate Email User',
        role: Role.USER,
      };

      await request(app.getHttpServer())
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload)
        .expect(409);
    });
  });

  describe('PATCH /admin/users/:id', () => {
    it('should update user fields successfully', async () => {
      const updatePayload = {
        fullName: 'New Custom Name',
        email: 'updated-email@edupub.test',
      };

      const response = await request(app.getHttpServer())
        .patch(`/admin/users/${normalUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatePayload)
        .expect(200);

      const body = response.body as TestUserResponse;
      expect(body.fullName).toBe(updatePayload.fullName);
      expect(body.email).toBe(updatePayload.email);
    });

    it('should reject duplicates with 409 Conflict', async () => {
      const updatePayload = {
        email: adminUser.email,
      };

      await request(app.getHttpServer())
        .patch(`/admin/users/${normalUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatePayload)
        .expect(409);
    });
  });

  describe('PATCH /admin/users/:id/role', () => {
    it('should change user role successfully', async () => {
      const rolePayload = { role: Role.ADMIN };

      const response = await request(app.getHttpServer())
        .patch(`/admin/users/${normalUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(rolePayload)
        .expect(200);

      const body = response.body as TestUserResponse;
      expect(body.role).toBe(Role.ADMIN);
    });

    it('should prevent admin from changing their own role', async () => {
      await request(app.getHttpServer())
        .patch(`/admin/users/${adminUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: Role.USER })
        .expect(400);
    });

    it('should prevent changing role if it leaves zero admins', async () => {
      // Demote current admin
      await request(app.getHttpServer())
        .patch(`/admin/users/${adminUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: Role.USER })
        .expect(400);
    });
  });

  describe('DELETE /admin/users/:id', () => {
    it('should delete user successfully', async () => {
      await request(app.getHttpServer())
        .delete(`/admin/users/${normalUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify deletion in database
      const deletedUser = await prisma.user.findUnique({
        where: { id: normalUserId },
      });
      expect(deletedUser).toBeNull();
    });

    it('should prevent admin from self-deleting', async () => {
      await request(app.getHttpServer())
        .delete(`/admin/users/${adminUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('should prevent deleting the last admin', async () => {
      await request(app.getHttpServer())
        .delete(`/admin/users/${adminUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });
});
