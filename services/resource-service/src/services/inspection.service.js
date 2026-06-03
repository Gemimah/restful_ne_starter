import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';
import { sendInspectionNotification } from '../utils/notification.js';
import * as extinguisherService from './extinguisher.service.js';

export async function getAll(query) {
  const { page, limit, skip } = getPagination(query);
  const where = {};
  if (query.status) where.status = query.status;
  if (query.extinguisherId) where.extinguisherId = query.extinguisherId;

  const [data, total] = await Promise.all([
    prisma.inspection.findMany({
      where,
      skip,
      take: limit,
      orderBy: { scheduledDate: 'asc' },
      include: { extinguisher: { select: { serialNumber: true, location: true, type: true } } },
    }),
    prisma.inspection.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, { page, limit });
}

export async function getById(id) {
  const inspection = await prisma.inspection.findUnique({
    where: { id },
    include: { extinguisher: true },
  });
  if (!inspection) {
    throw new AppError('Inspection not found', 404);
  }
  return inspection;
}

export async function schedule(data, userId, userEmail) {
  const extinguisher = await extinguisherService.getById(data.extinguisherId);

  const inspection = await prisma.inspection.create({
    data: {
      extinguisherId: data.extinguisherId,
      scheduledDate: new Date(data.scheduledDate),
      scheduledTime: data.scheduledTime,
      scheduledBy: userId,
      notes: data.notes,
      notified: true,
    },
    include: { extinguisher: true },
  });

  await sendInspectionNotification({
    to: userEmail,
    serialNumber: extinguisher.serialNumber,
    location: extinguisher.location,
    scheduledDate: data.scheduledDate,
    scheduledTime: data.scheduledTime,
  });

  return inspection;
}

export async function update(id, data) {
  await getById(id);
  const payload = { ...data };
  if (data.scheduledDate) payload.scheduledDate = new Date(data.scheduledDate);
  return prisma.inspection.update({
    where: { id },
    data: payload,
    include: { extinguisher: true },
  });
}

export async function markOverdue() {
  const now = new Date();
  await prisma.inspection.updateMany({
    where: {
      status: 'PENDING',
      scheduledDate: { lt: now },
    },
    data: { status: 'OVERDUE' },
  });
}
