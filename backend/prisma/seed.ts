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

  // Regular user
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

  // Clear existing documents to ensure idempotent seeding
  await prisma.document.deleteMany({});

  // Seed Admin's documents (at least 10)
  await prisma.document.createMany({
    data: [
      {
        title: 'Sách Giải Toán Lớp 6',
        description: 'Tài liệu hướng dẫn giải bài tập toán lớp 6',
        subject: 'MATH',
        gradeLevel: 6,
        status: 'PUBLISHED',
        ownerId: admin.id,
      },
      {
        title: 'Đề Cương Tiếng Anh Lớp 9',
        description: 'Đề cương ôn thi học kỳ môn tiếng Anh lớp 9',
        subject: 'ENGLISH',
        gradeLevel: 9,
        status: 'DRAFT',
        ownerId: admin.id,
      },
      {
        title: 'Giáo Trình Vật Lý Lớp 10',
        description: 'Giáo trình vật lý 10 nâng cao',
        subject: 'PHYSICS',
        gradeLevel: 10,
        status: 'ARCHIVED',
        ownerId: admin.id,
      },
      {
        title: 'Đề Thi Học Kì 2 Hóa Học Lớp 11',
        description: 'Đề thi thử học kì 2 môn Hóa học lớp 11 kèm lời giải',
        subject: 'CHEMISTRY',
        gradeLevel: 11,
        status: 'PUBLISHED',
        ownerId: admin.id,
      },
      {
        title: 'Chuyên Đề Sinh Học Tế Bào Lớp 10',
        description: 'Tài liệu bồi dưỡng học sinh giỏi Sinh học lớp 10',
        subject: 'BIOLOGY',
        gradeLevel: 10,
        status: 'PUBLISHED',
        ownerId: admin.id,
      },
      {
        title: 'Tóm Tắt Địa Lý Tự Nhiên Việt Nam Lớp 8',
        description: 'Tóm tắt kiến thức địa lý lớp 8 học kỳ 1',
        subject: 'GEOGRAPHY',
        gradeLevel: 8,
        status: 'DRAFT',
        ownerId: admin.id,
      },
      {
        title: 'Tập Bản Đồ Lịch Sử Lớp 7',
        description: 'Tài liệu trực quan môn Lịch sử lớp 7',
        subject: 'HISTORY',
        gradeLevel: 7,
        status: 'PUBLISHED',
        ownerId: admin.id,
      },
      {
        title: 'Cơ Bản Về Khoa Học Máy Tính Lớp 6',
        description: 'Giới thiệu tin học căn bản cho học sinh lớp 6',
        subject: 'OTHER',
        gradeLevel: 6,
        status: 'ARCHIVED',
        ownerId: admin.id,
      },
      {
        title: 'Bộ Đề Kiểm Tra Ngữ Văn Lớp 12',
        description: 'Tuyển tập đề thi thử Ngữ văn THPT Quốc gia',
        subject: 'LITERATURE',
        gradeLevel: 12,
        status: 'PUBLISHED',
        ownerId: admin.id,
      },
      {
        title: 'Bồi Dưỡng Hình Học Không Gian Lớp 11',
        description: 'Các phương pháp chứng minh và tính toán hình học 11',
        subject: 'MATH',
        gradeLevel: 11,
        status: 'DRAFT',
        ownerId: admin.id,
      },
    ],
  });

  // Seed User's documents (at least 10)
  await prisma.document.createMany({
    data: [
      {
        title: 'Vần Học Dân Gian Việt Nam Lớp 10',
        description: 'Tổng hợp văn học học kỳ 1 lớp 10',
        subject: 'LITERATURE',
        gradeLevel: 10,
        status: 'PUBLISHED',
        ownerId: user.id,
      },
      {
        title: 'Bài Tập Toán Đại Số Lớp 12',
        description: 'Bài tập khảo sát hàm số lớp 12',
        subject: 'MATH',
        gradeLevel: 12,
        status: 'DRAFT',
        ownerId: user.id,
      },
      {
        title: 'Sách Luyện Thi IELTS Lớp 12',
        description: 'Sách tự học IELTS cấp tốc cho học sinh lớp 12',
        subject: 'ENGLISH',
        gradeLevel: 12,
        status: 'PUBLISHED',
        ownerId: user.id,
      },
      {
        title: 'Lịch Sử Thế Giới Cận Đại Lớp 9',
        description: 'Tổng hợp kiến thức lịch sử cận đại',
        subject: 'HISTORY',
        gradeLevel: 9,
        status: 'PUBLISHED',
        ownerId: user.id,
      },
      {
        title: 'Sách Giáo Khoa Khác Lớp 6',
        description: 'Tài liệu tham khảo môn học khác',
        subject: 'OTHER',
        gradeLevel: 6,
        status: 'DRAFT',
        ownerId: user.id,
      },
      {
        title: 'Giải Bài Tập Vật Lý Đại Cương Lớp 10',
        description: 'Sổ tay giải nhanh bài tập Vật lý 10',
        subject: 'PHYSICS',
        gradeLevel: 10,
        status: 'PUBLISHED',
        ownerId: user.id,
      },
      {
        title: 'Công Thức Hóa Học Vô Cơ Lớp 12',
        description: 'Bảng tra cứu nhanh công thức hóa học lớp 12',
        subject: 'CHEMISTRY',
        gradeLevel: 12,
        status: 'PUBLISHED',
        ownerId: user.id,
      },
      {
        title: 'Chuyên Đề Di Truyền Học Lớp 12',
        description: 'Phương pháp giải bài tập lai hai cặp tính trạng',
        subject: 'BIOLOGY',
        gradeLevel: 12,
        status: 'DRAFT',
        ownerId: user.id,
      },
      {
        title: 'Sơ Đồ Tư Duy Lịch Sử Lớp 11',
        description: 'Hệ thống hóa kiến thức Lịch sử bằng sơ đồ tư duy',
        subject: 'HISTORY',
        gradeLevel: 11,
        status: 'PUBLISHED',
        ownerId: user.id,
      },
      {
        title: 'Bản Đồ Địa Lý Kinh Tế Lớp 9',
        description: 'Phân tích các vùng kinh tế trọng điểm Việt Nam',
        subject: 'GEOGRAPHY',
        gradeLevel: 9,
        status: 'ARCHIVED',
        ownerId: user.id,
      },
    ],
  });

  console.log('Seeding completed.');
  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
