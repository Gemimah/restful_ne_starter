import './env.js';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function connectDatabase() {
  await prisma.$connect();
  console.log('✅ Connected to shared database (ne_exam_db) — Reporting Service');
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}
