import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Subject, DocumentStatus, Prisma } from '@prisma/client';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    document: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockUserPayload: JwtPayload = {
    sub: 'user-uuid-1',
    email: 'user1@example.com',
    role: 'USER',
  };

  const mockAdminPayload: JwtPayload = {
    sub: 'admin-uuid-1',
    email: 'admin@example.com',
    role: 'ADMIN',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should call prisma.document.create with current user sub as ownerId', async () => {
      const dto = {
        title: 'New Doc',
        subject: Subject.MATH,
        gradeLevel: 10,
      };

      const expectedResponse = {
        id: 'doc-1',
        ...dto,
        ownerId: mockUserPayload.sub,
      };
      mockPrismaService.document.create.mockResolvedValue(expectedResponse);

      const result = await service.create(mockUserPayload, dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.document.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          ownerId: mockUserPayload.sub,
        },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true,
              avatarUrl: true,
            },
          },
        },
      });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('buildWhereClause', () => {
    it('should restrict to ownerId for regular users', () => {
      const where: Prisma.DocumentWhereInput = service.buildWhereClause(mockUserPayload, {});
      expect(where.ownerId).toBe(mockUserPayload.sub);
    });

    it('should ALSO restrict to ownerId for admin users (My Documents scoped to own)', () => {
      const where: Prisma.DocumentWhereInput = service.buildWhereClause(mockAdminPayload, {});
      expect(where.ownerId).toBe(mockAdminPayload.sub);
    });

    it('should include filters for subject, status, gradeLevel and search query q', () => {
      const query = {
        subject: Subject.MATH,
        status: DocumentStatus.PUBLISHED,
        gradeLevel: 10,
        q: 'calculus',
      };

      const where: Prisma.DocumentWhereInput = service.buildWhereClause(mockAdminPayload, query);

      expect(where.subject).toBe(Subject.MATH);
      expect(where.status).toBe(DocumentStatus.PUBLISHED);
      expect(where.gradeLevel).toBe(10);
      expect(where.OR).toEqual([
        { title: { contains: 'calculus', mode: 'insensitive' } },
        { description: { contains: 'calculus', mode: 'insensitive' } },
      ]);
    });

    it('should trim the search query q before searching', () => {
      const query = {
        q: '  calculus  ',
      };

      const where: Prisma.DocumentWhereInput = service.buildWhereClause(mockAdminPayload, query);

      expect(where.OR).toEqual([
        { title: { contains: 'calculus', mode: 'insensitive' } },
        { description: { contains: 'calculus', mode: 'insensitive' } },
      ]);
    });
  });

  describe('buildAdminWhereClause', () => {
    it('should NOT restrict to any ownerId — returns all documents', () => {
      const where: Prisma.DocumentWhereInput = service.buildAdminWhereClause({});
      expect(where.ownerId).toBeUndefined();
    });

    it('should apply subject/status/gradeLevel filters and case-insensitive search', () => {
      const query = {
        subject: Subject.MATH,
        status: DocumentStatus.PUBLISHED,
        gradeLevel: 10,
        q: 'calculus',
      };

      const where: Prisma.DocumentWhereInput = service.buildAdminWhereClause(query);

      expect(where.subject).toBe(Subject.MATH);
      expect(where.status).toBe(DocumentStatus.PUBLISHED);
      expect(where.gradeLevel).toBe(10);
      expect(where.OR).toEqual([
        { title: { contains: 'calculus', mode: 'insensitive' } },
        { description: { contains: 'calculus', mode: 'insensitive' } },
      ]);
    });
  });

  describe('ensureDocumentAccessible', () => {
    it('should return the document if it exists and belongs to the user', async () => {
      const mockDoc = { id: 'doc-1', ownerId: mockUserPayload.sub };
      mockPrismaService.document.findUnique.mockResolvedValue(mockDoc);

      const result = await service.ensureDocumentAccessible('doc-1', mockUserPayload);
      expect(result).toEqual(mockDoc);
    });

    it('should return the document if it exists and requester is ADMIN', async () => {
      const mockDoc = { id: 'doc-1', ownerId: 'other-user-uuid' };
      mockPrismaService.document.findUnique.mockResolvedValue(mockDoc);

      const result = await service.ensureDocumentAccessible('doc-1', mockAdminPayload);
      expect(result).toEqual(mockDoc);
    });

    it('should throw NotFoundException if document does not exist', async () => {
      mockPrismaService.document.findUnique.mockResolvedValue(null);

      await expect(service.ensureDocumentAccessible('non-existent', mockUserPayload)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if document belongs to another user and requester is not ADMIN', async () => {
      const mockDoc = { id: 'doc-1', ownerId: 'other-user-uuid' };
      mockPrismaService.document.findUnique.mockResolvedValue(mockDoc);

      await expect(service.ensureDocumentAccessible('doc-1', mockUserPayload)).rejects.toThrow(NotFoundException);
    });
  });
});
