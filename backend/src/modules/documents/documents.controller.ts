import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { QueryDocumentsDto } from './dto/query-documents.dto';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  create(@CurrentUser() currentUser: JwtPayload, @Body() createDocumentDto: CreateDocumentDto) {
    return this.documentsService.create(currentUser, createDocumentDto);
  }

  @Get()
  findAll(@CurrentUser() currentUser: JwtPayload, @Query() queryDto: QueryDocumentsDto) {
    return this.documentsService.findAll(currentUser, queryDto);
  }

  @Get(':id')
  findOne(@CurrentUser() currentUser: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.documentsService.findOne(currentUser, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() currentUser: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(currentUser, id, updateDocumentDto);
  }

  @Delete(':id')
  remove(@CurrentUser() currentUser: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.documentsService.remove(currentUser, id);
  }
}
