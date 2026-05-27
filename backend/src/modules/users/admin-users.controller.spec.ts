import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '@prisma/client';
import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AdminUsersController } from './admin-users.controller';

describe('AdminUsersController', () => {
  let controller: AdminUsersController;

  const mockUsersService = {
    findAllForAdmin: jest.fn(),
    findOneForAdmin: jest.fn(),
    createByAdmin: jest.fn(),
    updateByAdmin: jest.fn(),
    updateRoleByAdmin: jest.fn(),
    deleteByAdmin: jest.fn(),
  };

  const mockJwtService = {};

  const mockAdminPayload = {
    sub: 'admin-uuid-1',
    email: 'admin@example.com',
    role: Role.ADMIN,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context
            .switchToHttp()
            .getRequest<Request & { user?: typeof mockAdminPayload }>();
          req.user = mockAdminPayload;
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = module.get<AdminUsersController>(AdminUsersController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAllForAdmin with correct query params', async () => {
      const queryDto = { page: 1, limit: 10 };
      const expectedResult = {
        items: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      mockUsersService.findAllForAdmin.mockResolvedValue(expectedResult);

      const result = (await controller.findAll(queryDto)) as unknown as typeof expectedResult;

      expect(mockUsersService.findAllForAdmin).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should call service.findOneForAdmin with correct user ID', async () => {
      const userId = 'user-uuid-123';
      const expectedResult = {
        id: userId,
        email: 'user@example.com',
        fullName: 'User One',
        role: Role.USER,
        avatarUrl: null,
        documentsCount: 0,
        recentDocuments: [],
      };
      mockUsersService.findOneForAdmin.mockResolvedValue(expectedResult);

      const result = (await controller.findOne(userId)) as unknown as typeof expectedResult;

      expect(mockUsersService.findOneForAdmin).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('create', () => {
    it('should call service.createByAdmin with correct create payload', async () => {
      const createDto = {
        email: 'new@example.com',
        password: 'Password123',
        fullName: 'New User',
        role: Role.USER,
      };
      const expectedResult = {
        id: 'new-uuid',
        email: createDto.email,
        fullName: createDto.fullName,
        role: createDto.role,
        avatarUrl: undefined,
        documentsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUsersService.createByAdmin.mockResolvedValue(expectedResult);

      const result = (await controller.create(createDto)) as unknown as typeof expectedResult;

      expect(mockUsersService.createByAdmin).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should call service.updateByAdmin with correct edit payload', async () => {
      const userId = 'user-uuid-123';
      const updateDto = { fullName: 'Updated Name' };
      const expectedResult = {
        id: userId,
        email: 'user@example.com',
        fullName: 'Updated Name',
        role: Role.USER,
        avatarUrl: null,
        documentsCount: 0,
      };
      mockUsersService.updateByAdmin.mockResolvedValue(expectedResult);

      const result = (await controller.update(
        userId,
        updateDto,
      )) as unknown as typeof expectedResult;

      expect(mockUsersService.updateByAdmin).toHaveBeenCalledWith(userId, updateDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateRole', () => {
    it('should call service.updateRoleByAdmin with role payload and current admin payload', async () => {
      const userId = 'user-uuid-123';
      const updateRoleDto = { role: Role.ADMIN };
      const expectedResult = {
        id: userId,
        email: 'user@example.com',
        fullName: 'User',
        role: Role.ADMIN,
        avatarUrl: null,
        documentsCount: 0,
      };
      mockUsersService.updateRoleByAdmin.mockResolvedValue(expectedResult);

      const result = (await controller.updateRole(
        userId,
        updateRoleDto,
        mockAdminPayload,
      )) as unknown as typeof expectedResult;

      expect(mockUsersService.updateRoleByAdmin).toHaveBeenCalledWith(
        userId,
        updateRoleDto,
        mockAdminPayload,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should call service.deleteByAdmin with user ID and current admin payload', async () => {
      const userId = 'user-uuid-123';
      const expectedResult = { message: 'User deleted successfully' };
      mockUsersService.deleteByAdmin.mockResolvedValue(expectedResult);

      const result = await controller.remove(userId, mockAdminPayload);

      expect(mockUsersService.deleteByAdmin).toHaveBeenCalledWith(userId, mockAdminPayload);
      expect(result).toEqual(expectedResult);
    });
  });
});
