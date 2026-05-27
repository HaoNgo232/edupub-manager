import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, User, Role } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { QueryUsersDto } from './dto/query-users.dto';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async findOneById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async findAllForAdmin(queryDto: QueryUsersDto) {
    const where = this.buildUserWhereClause(queryDto);
    const orderBy = this.buildUserOrderBy(queryDto);

    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { documents: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const items = users.map((u) => this.sanitizeUserForAdmin(u));

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

  async findOneForAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        documents: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            subject: true,
            gradeLevel: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        _count: {
          select: { documents: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, documents, _count, ...rest } = user;
    return {
      ...rest,
      documentsCount: _count.documents,
      recentDocuments: documents,
    };
  }

  async createByAdmin(dto: CreateAdminUserDto) {
    const existing = await this.findOneByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const saltRounds = Number(this.configService.get<number>('BCRYPT_SALT_ROUNDS')) || 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        role: dto.role,
        avatarUrl: dto.avatarUrl,
      },
    });

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      documentsCount: 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateByAdmin(userId: string, dto: UpdateAdminUserDto) {
    const user = await this.ensureUserExists(userId);

    if (dto.email && dto.email !== user.email) {
      const existing = await this.findOneByEmail(dto.email);
      if (existing) {
        throw new ConflictException('Email already exists');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      include: {
        _count: {
          select: { documents: true },
        },
      },
    });

    return this.sanitizeUserForAdmin(updatedUser);
  }

  async updateRoleByAdmin(userId: string, dto: UpdateUserRoleDto, currentAdmin: JwtPayload) {
    if (userId === currentAdmin.sub) {
      throw new BadRequestException('You cannot change your own role');
    }

    const userToUpdate = await this.ensureUserExists(userId);

    if (userToUpdate.role === Role.ADMIN && dto.role === Role.USER) {
      const adminCount = await this.countAdmins();
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot remove the last admin');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role: dto.role },
      include: {
        _count: {
          select: { documents: true },
        },
      },
    });

    return this.sanitizeUserForAdmin(updatedUser);
  }

  async deleteByAdmin(userId: string, currentAdmin: JwtPayload) {
    if (userId === currentAdmin.sub) {
      throw new BadRequestException('You cannot delete your own account');
    }

    const userToDelete = await this.ensureUserExists(userId);

    if (userToDelete.role === Role.ADMIN) {
      const adminCount = await this.countAdmins();
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot delete the last admin');
      }
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'User deleted successfully' };
  }

  async countAdmins(): Promise<number> {
    return this.prisma.user.count({
      where: { role: Role.ADMIN },
    });
  }

  async ensureUserExists(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  sanitizeUserForAdmin(
    user: Omit<User, 'passwordHash'> & { passwordHash?: string; _count?: { documents: number } },
  ): Omit<User, 'passwordHash'> & { documentsCount: number } {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, _count, ...rest } = user;
    return {
      ...rest,
      documentsCount: _count ? _count.documents : 0,
    };
  }

  buildUserWhereClause(queryDto: QueryUsersDto): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};

    if (queryDto.role) {
      where.role = queryDto.role;
    }

    if (queryDto.q) {
      where.OR = [
        { email: { contains: queryDto.q, mode: 'insensitive' } },
        { fullName: { contains: queryDto.q, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  buildUserOrderBy(queryDto: QueryUsersDto): Prisma.UserOrderByWithRelationInput {
    const sortBy = queryDto.sortBy || 'createdAt';
    const sortOrder = queryDto.sortOrder || 'desc';
    return {
      [sortBy]: sortOrder,
    };
  }
}
