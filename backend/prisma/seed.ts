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

  // Seed Admin's documents (at least 3)
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
    ],
  });

  // Seed User's documents (at least 5)
  await prisma.document.createMany({
    data: [
      {
        title: 'Văn Học Dân Gian Việt Nam Lớp 10',
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
