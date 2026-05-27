import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(recentLimit = 5) {
    const [
      summary,
      usersByRole,
      documentsByStatus,
      documentsBySubject,
      documentsByGradeLevel,
      recentDocuments,
      recentUsers,
    ] = await Promise.all([
      this.getSummary(),
      this.getUsersByRole(),
      this.getDocumentsByStatus(),
      this.getDocumentsBySubject(),
      this.getDocumentsByGradeLevel(),
      this.getRecentDocuments(recentLimit),
      this.getRecentUsers(recentLimit),
    ]);

    return {
      summary,
      usersByRole,
      documentsByStatus,
      documentsBySubject,
      documentsByGradeLevel,
      recentDocuments,
      recentUsers,
    };
  }

  private async getSummary() {
    const [
      totalUsers,
      totalAdmins,
      totalRegularUsers,
      totalDocuments,
      totalDraftDocuments,
      totalPublishedDocuments,
      totalArchivedDocuments,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
      this.prisma.user.count({ where: { role: 'USER' } }),
      this.prisma.document.count(),
      this.prisma.document.count({ where: { status: 'DRAFT' } }),
      this.prisma.document.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.document.count({ where: { status: 'ARCHIVED' } }),
    ]);

    return {
      totalUsers,
      totalAdmins,
      totalRegularUsers,
      totalDocuments,
      totalDraftDocuments,
      totalPublishedDocuments,
      totalArchivedDocuments,
    };
  }

  private async getUsersByRole() {
    const groups = await this.prisma.user.groupBy({
      by: ['role'],
      _count: {
        _all: true,
      },
    });

    const result = {
      ADMIN: 0,
      USER: 0,
    };

    for (const g of groups) {
      if (g.role === 'ADMIN' || g.role === 'USER') {
        result[g.role] = g._count._all;
      }
    }

    return [
      { role: 'ADMIN', count: result.ADMIN },
      { role: 'USER', count: result.USER },
    ];
  }

  private async getDocumentsByStatus() {
    const groups = await this.prisma.document.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
    });

    const result = {
      DRAFT: 0,
      PUBLISHED: 0,
      ARCHIVED: 0,
    };

    for (const g of groups) {
      if (g.status === 'DRAFT' || g.status === 'PUBLISHED' || g.status === 'ARCHIVED') {
        result[g.status] = g._count._all;
      }
    }

    return [
      { status: 'DRAFT', count: result.DRAFT },
      { status: 'PUBLISHED', count: result.PUBLISHED },
      { status: 'ARCHIVED', count: result.ARCHIVED },
    ];
  }

  private async getDocumentsBySubject() {
    const groups = await this.prisma.document.groupBy({
      by: ['subject'],
      _count: {
        _all: true,
      },
    });

    return groups.map((g) => ({
      subject: g.subject,
      count: g._count._all,
    }));
  }

  private async getDocumentsByGradeLevel() {
    const groups = await this.prisma.document.groupBy({
      by: ['gradeLevel'],
      _count: {
        _all: true,
      },
      orderBy: {
        gradeLevel: 'asc',
      },
    });

    const mapped = groups.map((g) => ({
      gradeLevel: g.gradeLevel,
      count: g._count._all,
    }));

    mapped.sort((a, b) => a.gradeLevel - b.gradeLevel);
    return mapped;
  }

  private async getRecentDocuments(recentLimit: number) {
    return this.prisma.document.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: recentLimit,
      select: {
        id: true,
        title: true,
        subject: true,
        gradeLevel: true,
        status: true,
        createdAt: true,
        updatedAt: true,
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

  private async getRecentUsers(recentLimit: number) {
    const users = await this.prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: recentLimit,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    return users.map((u) => {
      const { _count, ...rest } = u;
      return {
        ...rest,
        documentsCount: _count?.documents ?? 0,
      };
    });
  }
}
