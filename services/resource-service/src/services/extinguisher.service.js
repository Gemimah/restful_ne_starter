import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';

export async function getAll(query) {
  const { page, limit, skip } = getPagination(query);
  const where = {};
  if (query.status) where.status = query.status;
  if (query.type) where.type = query.type;

  const [data, total] = await Promise.all([
    prisma.fireExtinguisher.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { inspections: true, maintenanceLogs: true } } },
    }),
    prisma.fireExtinguisher.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, { page, limit });
}

export async function getById(id) {
  const extinguisher = await prisma.fireExtinguisher.findUnique({
    where: { id },
    include: {
      inspections: { orderBy: { scheduledDate: 'desc' }, take: 10 },
      maintenanceLogs: { orderBy: { maintenanceDate: 'desc' }, take: 10 },
    },
  });

  if (!extinguisher) {
    throw new AppError('Fire extinguisher not found', 404);
  }

  return extinguisher;
}

function ensureExpiryAfterInstallation(installationDate, expiryDate) {
  const install = new Date(installationDate);
  const expiry = new Date(expiryDate);
  install.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  if (expiry <= install) {
    throw new AppError('Expiry date must be after installation date', 400);
  }
}

export async function create(data, userId) {
  const existing = await prisma.fireExtinguisher.findUnique({
    where: { serialNumber: data.serialNumber },
  });
  if (existing) {
    throw new AppError('Serial number already registered', 409);
  }

  const installationDate = new Date(data.installationDate);
  const expiryDate = new Date(data.expiryDate);
  ensureExpiryAfterInstallation(installationDate, expiryDate);

  return prisma.fireExtinguisher.create({
    data: {
      ...data,
      installationDate,
      expiryDate,
      registeredBy: userId,
    },
  });
}

export async function update(id, data) {
  const current = await getById(id);

  if (data.serialNumber) {
    const existing = await prisma.fireExtinguisher.findFirst({
      where: { serialNumber: data.serialNumber, NOT: { id } },
    });
    if (existing) {
      throw new AppError('Serial number already in use', 409);
    }
  }

  const payload = { ...data };
  const installationDate = data.installationDate
    ? new Date(data.installationDate)
    : current.installationDate;
  const expiryDate = data.expiryDate ? new Date(data.expiryDate) : current.expiryDate;

  ensureExpiryAfterInstallation(installationDate, expiryDate);

  if (data.installationDate) payload.installationDate = installationDate;
  if (data.expiryDate) payload.expiryDate = expiryDate;

  return prisma.fireExtinguisher.update({ where: { id }, data: payload });
}

export async function remove(id) {
  await getById(id);
  await prisma.fireExtinguisher.delete({ where: { id } });
  return { message: 'Fire extinguisher deleted successfully' };
}
