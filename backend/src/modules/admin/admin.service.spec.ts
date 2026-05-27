import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, DocumentStatus, Subject } from '@prisma/client';

describe('AdminService', () => {
  let service: AdminService;

  const mockPrismaService = {
    user: {
      count: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
    document: {
      count: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should aggregate and normalize stats correctly', async () => {
      // Mock counts for getSummary
      mockPrismaService.user.count.mockImplementation((args?: { where?: { role?: Role } }) => {
        if (!args || !args.where) return Promise.resolve(10); // totalUsers
        if (args.where.role === Role.ADMIN) return Promise.resolve(2);
        if (args.where.role === Role.USER) return Promise.resolve(8);
        return Promise.resolve(0);
      });

      mockPrismaService.document.count.mockImplementation((args?: { where?: { status?: DocumentStatus } }) => {
        if (!args || !args.where) return Promise.resolve(20); // totalDocuments
        if (args.where.status === DocumentStatus.DRAFT) return Promise.resolve(5);
        if (args.where.status === DocumentStatus.PUBLISHED) return Promise.resolve(12);
        if (args.where.status === DocumentStatus.ARCHIVED) return Promise.resolve(3);
        return Promise.resolve(0);
      });

      // Mock groupBy
      mockPrismaService.user.groupBy.mockResolvedValue([
        { role: Role.ADMIN, _count: { _all: 2 } },
        { role: Role.USER, _count: { _all: 8 } },
      ]);

      mockPrismaService.document.groupBy.mockImplementation((args: { by: string[] }) => {
        if (args.by.includes('status')) {
          return Promise.resolve([
            { status: DocumentStatus.PUBLISHED, _count: { _all: 12 } },
            { status: DocumentStatus.DRAFT, _count: { _all: 5 } },
            // ARCHIVED is missing to test normalization
          ]);
        }
        if (args.by.includes('subject')) {
          return Promise.resolve([
            { subject: Subject.MATH, _count: { _all: 15 } },
            { subject: Subject.ENGLISH, _count: { _all: 5 } },
          ]);
        }
        if (args.by.includes('gradeLevel')) {
          return Promise.resolve([
            { gradeLevel: 10, _count: { _all: 12 } },
            { gradeLevel: 6, _count: { _all: 8 } },
          ]);
        }
        return Promise.resolve([]);
      });

      // Mock findMany for recent lists
      mockPrismaService.document.findMany.mockResolvedValue([
        {
          id: 'doc-1',
          title: 'Math Book',
          subject: Subject.MATH,
          gradeLevel: 10,
          status: DocumentStatus.PUBLISHED,
          createdAt: new Date(),
          updatedAt: new Date(),
          owner: {
            id: 'owner-1',
            email: 'owner@example.com',
            fullName: 'Owner Full Name',
            role: Role.USER,
            avatarUrl: null,
          },
        },
      ]);

      mockPrismaService.user.findMany.mockResolvedValue([
        {
          id: 'user-1',
          email: 'user1@example.com',
          fullName: 'User One',
          role: Role.USER,
          avatarUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { documents: 3 },
        },
      ]);

      interface OwnerInfoMock {
        id: string;
        email: string;
        fullName: string;
        role: Role;
        avatarUrl: string | null;
        passwordHash?: string;
      }

      interface RecentDocMock {
        id: string;
        title: string;
        subject: Subject;
        gradeLevel: number;
        status: DocumentStatus;
        owner: OwnerInfoMock;
      }

      interface RecentUserMock {
        id: string;
        email: string;
        fullName: string;
        role: Role;
        avatarUrl: string | null;
        documentsCount: number;
        createdAt: Date;
        updatedAt: Date;
      }

      interface StatsResultMock {
        summary: Record<string, number>;
        usersByRole: { role: Role; count: number }[];
        documentsByStatus: { status: DocumentStatus; count: number }[];
        documentsBySubject: { subject: Subject; count: number }[];
        documentsByGradeLevel: { gradeLevel: number; count: number }[];
        recentDocuments: RecentDocMock[];
        recentUsers: RecentUserMock[];
      }

      const result = (await service.getStats(5)) as unknown as StatsResultMock;

      // Verify structure
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('usersByRole');
      expect(result).toHaveProperty('documentsByStatus');
      expect(result).toHaveProperty('documentsBySubject');
      expect(result).toHaveProperty('documentsByGradeLevel');
      expect(result).toHaveProperty('recentDocuments');
      expect(result).toHaveProperty('recentUsers');

      // Verify normalization of usersByRole
      expect(result.usersByRole).toEqual(
        expect.arrayContaining([
          { role: Role.ADMIN, count: 2 },
          { role: Role.USER, count: 8 },
        ]),
      );

      // Verify normalization of documentsByStatus (ARCHIVED should be normalized to 0)
      expect(result.documentsByStatus).toEqual(
        expect.arrayContaining([
          { status: DocumentStatus.DRAFT, count: 5 },
          { status: DocumentStatus.PUBLISHED, count: 12 },
          { status: DocumentStatus.ARCHIVED, count: 0 },
        ]),
      );

      // Verify sorting of grade levels
      expect(result.documentsByGradeLevel).toEqual([
        { gradeLevel: 6, count: 8 },
        { gradeLevel: 10, count: 12 },
      ]);

      // Verify format of recentUsers
      const firstRecentUser = result.recentUsers[0];
      expect(firstRecentUser.id).toBe('user-1');
      expect(firstRecentUser.email).toBe('user1@example.com');
      expect(firstRecentUser.fullName).toBe('User One');
      expect(firstRecentUser.role).toBe(Role.USER);
      expect(firstRecentUser.avatarUrl).toBeNull();
      expect(firstRecentUser.documentsCount).toBe(3);
      expect(firstRecentUser.createdAt).toBeInstanceOf(Date);
      expect(firstRecentUser.updatedAt).toBeInstanceOf(Date);

      // Verify owner passwordHash does not exist
      expect(result.recentDocuments[0].owner).not.toHaveProperty('passwordHash');
    });
  });
});
