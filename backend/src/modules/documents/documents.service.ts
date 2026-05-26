import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { QueryDocumentsDto } from './dto/query-documents.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(currentUser: JwtPayload, createDocumentDto: CreateDocumentDto) {
    return this.prisma.document.create({
      data: {
        ...createDocumentDto,
        ownerId: currentUser.sub,
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
  }

  async findAll(currentUser: JwtPayload, queryDto: QueryDocumentsDto) {
    const where = this.buildWhereClause(currentUser, queryDto);
    const orderBy = this.buildOrderBy(queryDto);

    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
      }),
      this.prisma.document.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }

  async findOne(currentUser: JwtPayload, documentId: string) {
    return this.ensureDocumentAccessible(documentId, currentUser);
  }

  async update(currentUser: JwtPayload, documentId: string, updateDocumentDto: UpdateDocumentDto) {
    await this.ensureDocumentAccessible(documentId, currentUser);

    return this.prisma.document.update({
      where: { id: documentId },
      data: updateDocumentDto,
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
  }

  async remove(currentUser: JwtPayload, documentId: string) {
    await this.ensureDocumentAccessible(documentId, currentUser);

    await this.prisma.document.delete({
      where: { id: documentId },
    });

    return { message: 'Document deleted successfully' };
  }

  buildWhereClause(
    currentUser: JwtPayload,
    queryDto: QueryDocumentsDto,
  ): Prisma.DocumentWhereInput {
    const where: Prisma.DocumentWhereInput = {};

    // Ownership rule
    if (currentUser.role !== 'ADMIN') {
      where.ownerId = currentUser.sub;
    }

    // Filters
    if (queryDto.subject) {
      where.subject = queryDto.subject;
    }
    if (queryDto.status) {
      where.status = queryDto.status;
    }
    if (queryDto.gradeLevel !== undefined) {
      where.gradeLevel = queryDto.gradeLevel;
    }

    // Search query q
    if (queryDto.q) {
      where.OR = [
        { title: { contains: queryDto.q, mode: 'insensitive' } },
        { description: { contains: queryDto.q, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  buildOrderBy(queryDto: QueryDocumentsDto): Prisma.DocumentOrderByWithRelationInput {
    const sortBy = queryDto.sortBy || 'createdAt';
    const sortOrder = queryDto.sortOrder || 'desc';
    return {
      [sortBy]: sortOrder,
    };
  }

  async ensureDocumentAccessible(documentId: string, currentUser: JwtPayload) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
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

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (currentUser.role !== 'ADMIN' && document.ownerId !== currentUser.sub) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }
}
