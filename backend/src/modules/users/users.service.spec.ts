import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(10),
  };

  const mockAdminPayload = {
    sub: 'admin-uuid-1',
    email: 'admin@example.com',
    role: Role.ADMIN,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllForAdmin', () => {
    it('should return a paginated list of users with documentsCount', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          fullName: 'User One',
          role: Role.USER,
          avatarUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          passwordHash: 'hashedpassword',
          _count: { documents: 5 },
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(1);

      const queryDto = { page: 1, limit: 10 };
      const result = (await service.findAllForAdmin(queryDto)) as {
        items: {
          id: string;
          email: string;
          fullName: string;
          role: Role;
          documentsCount: number;
        }[];
        meta: { total: number; totalPages: number };
      };

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).not.toHaveProperty('passwordHash');
      expect(result.items[0].documentsCount).toBe(5);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe('findOneForAdmin', () => {
    it('should return user detail with documentsCount and recentDocuments', async () => {
      const mockUserDetail = {
        id: 'user-1',
        email: 'user1@example.com',
        fullName: 'User One',
        role: Role.USER,
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash: 'hashedpassword',
        documents: [
          {
            id: 'doc-1',
            title: 'Sách Toán',
            subject: 'MATH',
            gradeLevel: 10,
            status: 'PUBLISHED',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        _count: { documents: 1 },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUserDetail);

      const result = (await service.findOneForAdmin('user-1')) as {
        email: string;
        fullName: string;
        role: Role;
        documentsCount: number;
        recentDocuments: { id: string; title: string }[];
      };

      expect(result).not.toHaveProperty('passwordHash');
      expect(result.documentsCount).toBe(1);
      expect(result.recentDocuments).toHaveLength(1);
      expect(result.recentDocuments[0].title).toBe('Sách Toán');
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOneForAdmin('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createByAdmin', () => {
    it('should create a new user and hash the password', async () => {
      const createDto = {
        email: 'new@example.com',
        password: 'Password123',
        fullName: 'New User',
        role: Role.USER,
        avatarUrl: 'https://example.com/avatar.png',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password_123');

      const mockCreatedUser = {
        id: 'new-uuid',
        email: createDto.email,
        fullName: createDto.fullName,
        role: createDto.role,
        avatarUrl: createDto.avatarUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash: 'hashed_password_123',
      };

      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);

      const result = (await service.createByAdmin(createDto)) as {
        email: string;
        documentsCount: number;
      };

      expect(result).not.toHaveProperty('passwordHash');
      expect(result.email).toBe(createDto.email);
      expect(result.documentsCount).toBe(0);
    });

    it('should throw ConflictException if email already exists', async () => {
      const createDto = {
        email: 'exists@example.com',
        password: 'Password123',
        fullName: 'Existing User',
        role: Role.USER,
      };

      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(service.createByAdmin(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('updateByAdmin', () => {
    it('should update user information and check for duplicate email', async () => {
      const updateDto = {
        email: 'updated@example.com',
        fullName: 'Updated Name',
      };

      const mockExistingUser = {
        id: 'user-1',
        email: 'old@example.com',
        fullName: 'Old Name',
        role: Role.USER,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockExistingUser);
      // Mock findOneByEmail for the new email to return null (no duplicate)
      mockPrismaService.user.findUnique.mockImplementation(
        (args: { where: { id?: string; email?: string } }) => {
          if (args.where.id === 'user-1') return mockExistingUser;
          if (args.where.email === 'updated@example.com') return null;
          return null;
        },
      );

      const mockUpdatedUser = {
        ...mockExistingUser,
        email: updateDto.email,
        fullName: updateDto.fullName,
        _count: { documents: 3 },
      };

      mockPrismaService.user.update.mockResolvedValue(mockUpdatedUser);

      const result = (await service.updateByAdmin('user-1', updateDto)) as {
        email: string;
        fullName: string;
        documentsCount: number;
      };

      expect(result.email).toBe(updateDto.email);
      expect(result.fullName).toBe(updateDto.fullName);
      expect(result.documentsCount).toBe(3);
    });

    it('should throw ConflictException if new email belongs to another user', async () => {
      const updateDto = {
        email: 'taken@example.com',
      };

      const mockExistingUser = {
        id: 'user-1',
        email: 'old@example.com',
        role: Role.USER,
      };

      // Mock findUnique to return the user when query is by id, and return another user when query is by email
      mockPrismaService.user.findUnique.mockImplementation(
        (args: { where: { id?: string; email?: string } }) => {
          if (args.where.id === 'user-1') return mockExistingUser;
          if (args.where.email === 'taken@example.com')
            return { id: 'user-2', email: 'taken@example.com' };
          return null;
        },
      );

      await expect(service.updateByAdmin('user-1', updateDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('updateRoleByAdmin', () => {
    it("should allow changing a user's role", async () => {
      const updateRoleDto = { role: Role.ADMIN };
      const mockUser = {
        id: 'user-1',
        email: 'user@example.com',
        role: Role.USER,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        role: Role.ADMIN,
        _count: { documents: 2 },
      });

      const result = (await service.updateRoleByAdmin(
        'user-1',
        updateRoleDto,
        mockAdminPayload,
      )) as {
        role: Role;
        documentsCount: number;
      };

      expect(result.role).toBe(Role.ADMIN);
      expect(result.documentsCount).toBe(2);
    });

    it('should prevent an admin from changing their own role', async () => {
      const updateRoleDto = { role: Role.USER };

      await expect(
        service.updateRoleByAdmin(mockAdminPayload.sub, updateRoleDto, mockAdminPayload),
      ).rejects.toThrow(BadRequestException);
    });

    it('should prevent demoting the last admin', async () => {
      const updateRoleDto = { role: Role.USER };
      const mockUser = {
        id: 'admin-2',
        email: 'admin2@example.com',
        role: Role.ADMIN,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      // Mock count to return 1 admin left in the system
      mockPrismaService.user.count.mockResolvedValue(1);

      await expect(
        service.updateRoleByAdmin('admin-2', updateRoleDto, mockAdminPayload),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteByAdmin', () => {
    it('should delete a user successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@example.com',
        role: Role.USER,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.deleteByAdmin('user-1', mockAdminPayload);

      expect(result).toEqual({ message: 'User deleted successfully' });
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    });

    it('should prevent an admin from deleting their own account', async () => {
      await expect(service.deleteByAdmin(mockAdminPayload.sub, mockAdminPayload)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should prevent deleting the last admin', async () => {
      const mockUser = {
        id: 'admin-2',
        email: 'admin2@example.com',
        role: Role.ADMIN,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.count.mockResolvedValue(1);

      await expect(service.deleteByAdmin('admin-2', mockAdminPayload)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
