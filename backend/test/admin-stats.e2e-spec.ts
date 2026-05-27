import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role, DocumentStatus, Subject } from '@prisma/client';
import * as bcrypt from 'bcrypt';

interface SummaryStats {
  totalUsers: number;
  totalAdmins: number;
  totalRegularUsers: number;
  totalDocuments: number;
  totalDraftDocuments: number;
  totalPublishedDocuments: number;
  totalArchivedDocuments: number;
}

interface RoleStat {
  role: string;
  count: number;
}

interface StatusStat {
  status: string;
  count: number;
}

interface SubjectStat {
  subject: string;
  count: number;
}

interface GradeLevelStat {
  gradeLevel: number;
  count: number;
}

interface OwnerInfo {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl: string | null;
  passwordHash?: string;
}

interface RecentDoc {
  id: string;
  title: string;
  subject: string;
  gradeLevel: number;
  status: string;
  owner: OwnerInfo;
  createdAt: string;
  updatedAt: string;
}

interface RecentUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl: string | null;
  documentsCount: number;
  createdAt: string;
  updatedAt: string;
  passwordHash?: string;
}

interface StatsResponse {
  summary: SummaryStats;
  usersByRole: RoleStat[];
  documentsByStatus: StatusStat[];
  documentsBySubject: SubjectStat[];
  documentsByGradeLevel: GradeLevelStat[];
  recentDocuments: RecentDoc[];
  recentUsers: RecentUser[];
}

interface AuthRegisterResponse {
  user: {
    id: string;
  };
  accessToken: string;
}

describe('AdminStats (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminToken = '';
  let userToken = '';
  let adminUserId = '';
  let normalUserId = '';

  const adminUser = {
    email: 'admin-stats-e2e@edupub.test',
    password: 'AdminPassword123',
    fullName: 'Admin Stats E2E User',
  };

  const normalUser = {
    email: 'user-stats-e2e@edupub.test',
    password: 'UserPassword123',
    fullName: 'User Stats E2E User',
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
    // Clear database
    await prisma.document.deleteMany({});
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
    const userRegisterRes = await request(app.getHttpServer()).post('/auth/register').send(normalUser).expect(201);

    const regBody = userRegisterRes.body as AuthRegisterResponse;
    userToken = regBody.accessToken;
    normalUserId = regBody.user.id;
  });

  afterAll(async () => {
    await prisma.document.deleteMany({});
    await prisma.user.deleteMany({});
    await app.close();
  });

  describe('GET /admin/stats', () => {
    it('should fail with 401 Unauthorized if token is missing', async () => {
      await request(app.getHttpServer()).get('/admin/stats').expect(401);
    });

    it('should block non-admin users with 403 Forbidden', async () => {
      await request(app.getHttpServer()).get('/admin/stats').set('Authorization', `Bearer ${userToken}`).expect(403);
    });

    it('should return correct empty statistics response if no documents exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = response.body as StatsResponse;

      // Summary checks
      expect(body.summary).toEqual({
        totalUsers: 2,
        totalAdmins: 1,
        totalRegularUsers: 1,
        totalDocuments: 0,
        totalDraftDocuments: 0,
        totalPublishedDocuments: 0,
        totalArchivedDocuments: 0,
      });

      // Role breakdown checks (normalized)
      expect(body.usersByRole).toEqual(
        expect.arrayContaining([
          { role: 'ADMIN', count: 1 },
          { role: 'USER', count: 1 },
        ]),
      );

      // Status breakdown checks (normalized)
      expect(body.documentsByStatus).toEqual(
        expect.arrayContaining([
          { status: 'DRAFT', count: 0 },
          { status: 'PUBLISHED', count: 0 },
          { status: 'ARCHIVED', count: 0 },
        ]),
      );

      // Subject breakdown empty
      expect(body.documentsBySubject).toEqual([]);

      // GradeLevel breakdown empty
      expect(body.documentsByGradeLevel).toEqual([]);

      // Recent lists
      expect(body.recentDocuments).toEqual([]);
      // recentUsers has 2 entries (admin and normal user)
      expect(body.recentUsers).toHaveLength(2);
      expect(body.recentUsers[0]).not.toHaveProperty('passwordHash');
      expect(body.recentUsers[0]).toHaveProperty('documentsCount', 0);
    });

    it('should return correct statistics with populated data', async () => {
      // Seed some documents
      const docsData = [
        {
          title: 'Doc A',
          subject: Subject.MATH,
          gradeLevel: 10,
          status: DocumentStatus.PUBLISHED,
          ownerId: normalUserId,
        },
        { title: 'Doc B', subject: Subject.MATH, gradeLevel: 8, status: DocumentStatus.DRAFT, ownerId: normalUserId },
        {
          title: 'Doc C',
          subject: Subject.LITERATURE,
          gradeLevel: 12,
          status: DocumentStatus.PUBLISHED,
          ownerId: normalUserId,
        },
        {
          title: 'Doc D',
          subject: Subject.ENGLISH,
          gradeLevel: 10,
          status: DocumentStatus.ARCHIVED,
          ownerId: adminUserId,
        },
        {
          title: 'Doc E',
          subject: Subject.MATH,
          gradeLevel: 10,
          status: DocumentStatus.PUBLISHED,
          ownerId: adminUserId,
        },
        {
          title: 'Doc F',
          subject: Subject.PHYSICS,
          gradeLevel: 11,
          status: DocumentStatus.PUBLISHED,
          ownerId: adminUserId,
        },
      ];

      for (const d of docsData) {
        await prisma.document.create({ data: d });
      }

      const response = await request(app.getHttpServer())
        .get('/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = response.body as StatsResponse;

      // Summary
      expect(body.summary).toEqual({
        totalUsers: 2,
        totalAdmins: 1,
        totalRegularUsers: 1,
        totalDocuments: 6,
        totalDraftDocuments: 1,
        totalPublishedDocuments: 4,
        totalArchivedDocuments: 1,
      });

      // Role breakdown
      expect(body.usersByRole).toEqual(
        expect.arrayContaining([
          { role: 'ADMIN', count: 1 },
          { role: 'USER', count: 1 },
        ]),
      );

      // Status breakdown
      expect(body.documentsByStatus).toEqual(
        expect.arrayContaining([
          { status: 'DRAFT', count: 1 },
          { status: 'PUBLISHED', count: 4 },
          { status: 'ARCHIVED', count: 1 },
        ]),
      );

      // Subject breakdown
      expect(body.documentsBySubject).toEqual(
        expect.arrayContaining([
          { subject: 'MATH', count: 3 },
          { subject: 'LITERATURE', count: 1 },
          { subject: 'ENGLISH', count: 1 },
          { subject: 'PHYSICS', count: 1 },
        ]),
      );

      // GradeLevel breakdown (sorted asc by gradeLevel)
      expect(body.documentsByGradeLevel).toEqual([
        { gradeLevel: 8, count: 1 },
        { gradeLevel: 10, count: 3 },
        { gradeLevel: 11, count: 1 },
        { gradeLevel: 12, count: 1 },
      ]);

      // Recent documents
      expect(body.recentDocuments).toHaveLength(5); // limit defaults to 5
      expect(body.recentDocuments[0].title).toBe('Doc F'); // Last created first
      expect(body.recentDocuments[0]).toHaveProperty('owner');
      expect(body.recentDocuments[0].owner).not.toHaveProperty('passwordHash');

      // Recent users
      expect(body.recentUsers).toHaveLength(2);
      expect(body.recentUsers[0]).not.toHaveProperty('passwordHash');

      const normUser = body.recentUsers.find((u) => u.id === normalUserId);
      const admUser = body.recentUsers.find((u) => u.id === adminUserId);
      expect(normUser).toBeDefined();
      expect(admUser).toBeDefined();
      expect(normUser?.documentsCount).toBe(3);
      expect(admUser?.documentsCount).toBe(3);
    });

    it('should respect recentLimit query parameter if provided', async () => {
      // Seed some documents
      const docsData = [
        {
          title: 'Doc A',
          subject: Subject.MATH,
          gradeLevel: 10,
          status: DocumentStatus.PUBLISHED,
          ownerId: normalUserId,
        },
        { title: 'Doc B', subject: Subject.MATH, gradeLevel: 8, status: DocumentStatus.DRAFT, ownerId: normalUserId },
        {
          title: 'Doc C',
          subject: Subject.LITERATURE,
          gradeLevel: 12,
          status: DocumentStatus.PUBLISHED,
          ownerId: normalUserId,
        },
      ];

      for (const d of docsData) {
        await prisma.document.create({ data: d });
      }

      const response = await request(app.getHttpServer())
        .get('/admin/stats?recentLimit=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = response.body as StatsResponse;
      expect(body.recentDocuments).toHaveLength(2);
      expect(body.recentDocuments[0].title).toBe('Doc C'); // Most recent
    });
  });
});
