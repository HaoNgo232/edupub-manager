import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DocumentsService } from '../documents/documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtService } from '@nestjs/jwt';

describe('AdminController', () => {
  let controller: AdminController;

  const mockAdminService = {
    getStats: jest.fn(),
  };

  const mockDocumentsService = {
    findAllForAdmin: jest.fn(),
  };

  const mockJwtService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
        {
          provide: DocumentsService,
          useValue: mockDocumentsService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = module.get<AdminController>(AdminController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStats', () => {
    it('should call adminService.getStats with recentLimit default (5)', async () => {
      const mockResult = { summary: {} };
      mockAdminService.getStats.mockResolvedValue(mockResult);

      const result = await controller.getStats({});

      expect(mockAdminService.getStats).toHaveBeenCalledWith(5);
      expect(result).toEqual(mockResult);
    });

    it('should call adminService.getStats with parsed recentLimit query param', async () => {
      const mockResult = { summary: {} };
      mockAdminService.getStats.mockResolvedValue(mockResult);

      const result = await controller.getStats({ recentLimit: 10 });

      expect(mockAdminService.getStats).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockResult);
    });
  });

  describe('listAllDocuments', () => {
    it('should call documentsService.findAllForAdmin with query params', async () => {
      const mockResult = { items: [], meta: { total: 0 } };
      mockDocumentsService.findAllForAdmin.mockResolvedValue(mockResult);

      const queryDto = { page: 1, limit: 10 };
      const result = await controller.listAllDocuments(queryDto);

      expect(mockDocumentsService.findAllForAdmin).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(mockResult);
    });
  });
});
