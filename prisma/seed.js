/**
 * TZW LTD — Seed default ADMIN user only
 * Run: npm run db:seed
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

const ADMIN = {
  firstName: 'TZW',
  lastName: 'Administrator',
  email: 'admin@tzw.com',
  password: 'Admin@123',
  role: 'ADMIN',
};

async function main() {
  const hashedPassword = await bcrypt.hash(ADMIN.password, 12);

  await prisma.user.upsert({
    where: { email: ADMIN.email },
    update: {
      firstName: ADMIN.firstName,
      lastName: ADMIN.lastName,
      password: hashedPassword,
      role: ADMIN.role,
      isVerified: true,
      otp: null,
      otpExpiry: null,
    },
    create: {
      firstName: ADMIN.firstName,
      lastName: ADMIN.lastName,
      email: ADMIN.email,
      password: hashedPassword,
      role: ADMIN.role,
      isVerified: true,
    },
  });

  console.log(`✓ ADMIN seeded: ${ADMIN.email}  (password: ${ADMIN.password})`);
  console.log('  INSPECTOR and USER accounts must register via the app or be promoted by admin.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
