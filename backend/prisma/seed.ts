import { PrismaClient } from '../src/generated/prisma';
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
  await prisma.user.upsert({
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
  await prisma.user.upsert({
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

  console.log('Seeding completed.');
  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
