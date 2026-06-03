import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';

// EXAM TIP: Copy this file pattern for your domain module (cars, bookings, etc.)

export async function getAll(query, userId) {
  const { page, limit, skip } = getPagination(query);
  const where = { userId };

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.item.count({ where }),
  ]);

  return buildPaginatedResponse(items, total, { page, limit });
}

export async function getById(id, userId) {
  const item = await prisma.item.findFirst({
    where: { id, userId },
  });

  if (!item) {
    throw new AppError('Item not found', 404);
  }

  return item;
}

export async function create(data, userId) {
  return prisma.item.create({
    data: { ...data, userId },
  });
}

export async function update(id, data, userId) {
  await getById(id, userId);
  return prisma.item.update({
    where: { id },
    data,
  });
}

export async function remove(id, userId) {
  await getById(id, userId);
  await prisma.item.delete({ where: { id } });
  return { message: 'Item deleted successfully' };
}
