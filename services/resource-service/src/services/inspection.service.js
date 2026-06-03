import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';
import { sendInspectionNotification } from '../utils/notification.js';
import { assertInspectorCanAccessExtinguisher } from '../utils/extinguisherAccess.js';
import * as extinguisherService from './extinguisher.service.js';

function inspectorInspectionWhere(user) {
  if (user?.role === 'INSPECTOR') {
    return { extinguisher: { assignedInspectorId: user.id } };
  }
  return {};
}

async function getInspectionForUser(id, user) {
  const inspection = await prisma.inspection.findUnique({
    where: { id },
    include: { extinguisher: true },
  });
  if (!inspection) {
    throw new AppError('Inspection not found', 404);
  }
  assertInspectorCanAccessExtinguisher(inspection.extinguisher, user);
  return inspection;
}

export async function getAll(query, user) {
  const { page, limit, skip } = getPagination(query);
  const where = {
    ...inspectorInspectionWhere(user),
  };
  if (query.status) where.status = query.status;
  if (query.extinguisherId) where.extinguisherId = query.extinguisherId;

  const [data, total] = await Promise.all([
    prisma.inspection.findMany({
      where,
      skip,
      take: limit,
      orderBy: { scheduledDate: 'asc' },
      include: {
        extinguisher: {
          select: {
            serialNumber: true,
            location: true,
            type: true,
            assignedInspectorId: true,
          },
        },
      },
    }),
    prisma.inspection.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, { page, limit });
}

export async function getById(id, user) {
  return getInspectionForUser(id, user);
}

export async function schedule(data, userId, userEmail, user) {
  const extinguisher = await extinguisherService.getById(data.extinguisherId, user);

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

export async function update(id, data, user) {
  await getInspectionForUser(id, user);
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
