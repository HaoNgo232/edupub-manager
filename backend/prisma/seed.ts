import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in env');
  }
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('Seeding database...');

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
  const adminPasswordHash = await bcrypt.hash('Admin@123456', saltRounds);
  const userPasswordHash = await bcrypt.hash('User@123456', saltRounds);

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@edupub.test' },
    update: {
      passwordHash: adminPasswordHash,
      fullName: 'Admin User',
      role: 'ADMIN',
    },
    create: {
      email: 'admin@edupub.test',
      passwordHash: adminPasswordHash,
      fullName: 'Admin User',
      role: 'ADMIN',
    },
  });

  // Second Admin user
  const admin2 = await prisma.user.upsert({
    where: { email: 'admin2@edupub.test' },
    update: {
      passwordHash: adminPasswordHash,
      fullName: 'Admin User 2',
      role: 'ADMIN',
    },
    create: {
      email: 'admin2@edupub.test',
      passwordHash: adminPasswordHash,
      fullName: 'Admin User 2',
      role: 'ADMIN',
    },
  });

  // Regular user 1
  const user = await prisma.user.upsert({
    where: { email: 'user@edupub.test' },
    update: {
      passwordHash: userPasswordHash,
      fullName: 'Regular User',
      role: 'USER',
    },
    create: {
      email: 'user@edupub.test',
      passwordHash: userPasswordHash,
      fullName: 'Regular User',
      role: 'USER',
    },
  });

  // Regular user 2
  const user2 = await prisma.user.upsert({
    where: { email: 'user2@edupub.test' },
    update: {
      passwordHash: userPasswordHash,
      fullName: 'Regular User 2',
      role: 'USER',
    },
    create: {
      email: 'user2@edupub.test',
      passwordHash: userPasswordHash,
      fullName: 'Regular User 2',
      role: 'USER',
    },
  });

  // Regular user 3
  const user3 = await prisma.user.upsert({
    where: { email: 'user3@edupub.test' },
    update: {
      passwordHash: userPasswordHash,
      fullName: 'Regular User 3',
      role: 'USER',
    },
    create: {
      email: 'user3@edupub.test',
      passwordHash: userPasswordHash,
      fullName: 'Regular User 3',
      role: 'USER',
    },
  });

  // Regular user 4
  const user4 = await prisma.user.upsert({
    where: { email: 'user4@edupub.test' },
    update: {
      passwordHash: userPasswordHash,
      fullName: 'Regular User 4',
      role: 'USER',
    },
    create: {
      email: 'user4@edupub.test',
      passwordHash: userPasswordHash,
      fullName: 'Regular User 4',
      role: 'USER',
    },
  });

  // Regular user 5
  const user5 = await prisma.user.upsert({
    where: { email: 'user5@edupub.test' },
    update: {
      passwordHash: userPasswordHash,
      fullName: 'Regular User 5',
      role: 'USER',
    },
    create: {
      email: 'user5@edupub.test',
      passwordHash: userPasswordHash,
      fullName: 'Regular User 5',
      role: 'USER',
    },
  });

  // Clear existing documents to ensure idempotent seeding
  await prisma.document.deleteMany({});

  // Clear extra users (created by previous E2E test runs) to prevent test database pollution
  await prisma.user.deleteMany({
    where: {
      NOT: {
        email: {
          in: [
            'admin@edupub.test',
            'admin2@edupub.test',
            'user@edupub.test',
            'user2@edupub.test',
            'user3@edupub.test',
            'user4@edupub.test',
            'user5@edupub.test',
          ],
        },
      },
    },
  });

  // Seed Admin's documents (at least 10)
  const adminDocumentTemplates = [
    {
      title: 'Sách Giải Toán Lớp 6',
      description: 'Tài liệu hướng dẫn giải bài tập toán lớp 6',
      subject: 'MATH' as const,
      gradeLevel: 6,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Đề Cương Tiếng Anh Lớp 9',
      description: 'Đề cương ôn thi học kỳ môn tiếng Anh lớp 9',
      subject: 'ENGLISH' as const,
      gradeLevel: 9,
      status: 'DRAFT' as const,
    },
    {
      title: 'Giáo Trình Vật Lý Lớp 10',
      description: 'Giáo trình vật lý 10 nâng cao',
      subject: 'PHYSICS' as const,
      gradeLevel: 10,
      status: 'ARCHIVED' as const,
    },
    {
      title: 'Đề Thi Học Kì 2 Hóa Học Lớp 11',
      description: 'Đề thi thử học kì 2 môn Hóa học lớp 11 kèm lời giải',
      subject: 'CHEMISTRY' as const,
      gradeLevel: 11,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Chuyên Đề Sinh Học Tế Bào Lớp 10',
      description: 'Tài liệu bồi dưỡng học sinh giỏi Sinh học lớp 10',
      subject: 'BIOLOGY' as const,
      gradeLevel: 10,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Tóm Tắt Địa Lý Tự Nhiên Việt Nam Lớp 8',
      description: 'Tóm tắt kiến thức địa lý lớp 8 học kỳ 1',
      subject: 'GEOGRAPHY' as const,
      gradeLevel: 8,
      status: 'DRAFT' as const,
    },
    {
      title: 'Tập Bản Đồ Lịch Sử Lớp 7',
      description: 'Tài liệu trực quan môn Lịch sử lớp 7',
      subject: 'HISTORY' as const,
      gradeLevel: 7,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Cơ Bản Về Khoa Học Máy Tính Lớp 6',
      description: 'Giới thiệu tin học căn bản cho học sinh lớp 6',
      subject: 'OTHER' as const,
      gradeLevel: 6,
      status: 'ARCHIVED' as const,
    },
    {
      title: 'Bộ Đề Kiểm Tra Ngữ Văn Lớp 12',
      description: 'Tuyển tập đề thi thử Ngữ văn THPT Quốc gia',
      subject: 'LITERATURE' as const,
      gradeLevel: 12,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Bồi Dưỡng Hình Học Không Gian Lớp 11',
      description: 'Các phương pháp chứng minh và tính toán hình học 11',
      subject: 'MATH' as const,
      gradeLevel: 11,
      status: 'DRAFT' as const,
    },
  ];

  for (const owner of [admin, admin2]) {
    await prisma.document.createMany({
      data: adminDocumentTemplates.map((doc) => ({
        ...doc,
        ownerId: owner.id,
      })),
    });
  }

  // Seed User's documents (at least 10)
  const userDocumentTemplates = [
    {
      title: 'Vần Học Dân Gian Việt Nam Lớp 10',
      description: 'Tổng hợp văn học học kỳ 1 lớp 10',
      subject: 'LITERATURE' as const,
      gradeLevel: 10,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Bài Tập Toán Đại Số Lớp 12',
      description: 'Bài tập khảo sát hàm số lớp 12',
      subject: 'MATH' as const,
      gradeLevel: 12,
      status: 'DRAFT' as const,
    },
    {
      title: 'Sách Luyện Thi IELTS Lớp 12',
      description: 'Sách tự học IELTS cấp tốc cho học sinh lớp 12',
      subject: 'ENGLISH' as const,
      gradeLevel: 12,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Lịch Sử Thế Giới Cận Đại Lớp 9',
      description: 'Tổng hợp kiến thức lịch sử cận đại',
      subject: 'HISTORY' as const,
      gradeLevel: 9,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Sách Giáo Khoa Khác Lớp 6',
      description: 'Tài liệu tham khảo môn học khác',
      subject: 'OTHER' as const,
      gradeLevel: 6,
      status: 'DRAFT' as const,
    },
    {
      title: 'Giải Bài Tập Vật Lý Đại Cương Lớp 10',
      description: 'Sổ tay giải nhanh bài tập Vật lý 10',
      subject: 'PHYSICS' as const,
      gradeLevel: 10,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Công Thức Hóa Học Vô Cơ Lớp 12',
      description: 'Bảng tra cứu nhanh công thức hóa học lớp 12',
      subject: 'CHEMISTRY' as const,
      gradeLevel: 12,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Chuyên Đề Di Truyền Học Lớp 12',
      description: 'Phương pháp giải bài tập lai hai cặp tính trạng',
      subject: 'BIOLOGY' as const,
      gradeLevel: 12,
      status: 'DRAFT' as const,
    },
    {
      title: 'Sơ Đồ Tư Duy Lịch Sử Lớp 11',
      description: 'Hệ thống hóa kiến thức Lịch sử bằng sơ đồ tư duy',
      subject: 'HISTORY' as const,
      gradeLevel: 11,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Bản Đồ Địa Lý Kinh Tế Lớp 9',
      description: 'Phân tích các vùng kinh tế trọng điểm Việt Nam',
      subject: 'GEOGRAPHY' as const,
      gradeLevel: 9,
      status: 'ARCHIVED' as const,
    },
  ];

  for (const owner of [user, user2, user3, user4, user5]) {
    await prisma.document.createMany({
      data: userDocumentTemplates.map((doc) => ({
        ...doc,
        ownerId: owner.id,
      })),
    });
  }

  console.log('Seeding completed.');
  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
