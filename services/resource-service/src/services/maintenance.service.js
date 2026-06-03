import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';
import { assertInspectorCanAccessExtinguisher } from '../utils/extinguisherAccess.js';
import * as extinguisherService from './extinguisher.service.js';

function inspectorMaintenanceWhere(user) {
  if (user?.role === 'INSPECTOR') {
    return { extinguisher: { assignedInspectorId: user.id } };
  }
  return {};
}

export async function getAll(query, user) {
  const { page, limit, skip } = getPagination(query);
  const where = {
    ...inspectorMaintenanceWhere(user),
  };
  if (query.extinguisherId) where.extinguisherId = query.extinguisherId;

  const [data, total] = await Promise.all([
    prisma.maintenanceLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { maintenanceDate: 'desc' },
      include: { extinguisher: { select: { serialNumber: true, location: true } } },
    }),
    prisma.maintenanceLog.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, { page, limit });
}

export async function getById(id, user) {
  const log = await prisma.maintenanceLog.findUnique({
    where: { id },
    include: { extinguisher: true },
  });
  if (!log) {
    throw new AppError('Maintenance log not found', 404);
  }
  assertInspectorCanAccessExtinguisher(log.extinguisher, user);
  return log;
}

export async function create(data, userId, user) {
  await extinguisherService.getById(data.extinguisherId, user);

  const log = await prisma.maintenanceLog.create({
    data: {
      extinguisherId: data.extinguisherId,
      actionTaken: data.actionTaken,
      maintenanceDate: new Date(data.maintenanceDate),
      issuesIdentified: data.issuesIdentified,
      notes: data.notes,
      performedBy: userId,
    },
    include: { extinguisher: true },
  });

  await prisma.fireExtinguisher.update({
    where: { id: data.extinguisherId },
    data: { status: 'ACTIVE' },
  });

  return log;
}
