import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { AdminStatsQueryDto } from './dto/admin-stats-query.dto';
import { DocumentsService } from '../documents/documents.service';
import { QueryDocumentsDto } from '../documents/dto/query-documents.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly documentsService: DocumentsService,
  ) {}

  @Get('stats')
  getStats(@Query() query: AdminStatsQueryDto) {
    const limit = query.recentLimit !== undefined ? query.recentLimit : 5;
    return this.adminService.getStats(limit);
  }

  @Get('documents')
  listAllDocuments(@Query() queryDto: QueryDocumentsDto) {
    return this.documentsService.findAllForAdmin(queryDto);
  }
}
