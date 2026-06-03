import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';
import {
  assertInspectorCanAccessExtinguisher,
  extinguisherInclude,
  inspectorExtinguisherFilter,
  validateInspectorId,
} from '../utils/extinguisherAccess.js';

export async function getAll(query, user) {
  const { page, limit, skip } = getPagination(query);
  const where = {
    ...inspectorExtinguisherFilter(user),
  };
  if (query.status) where.status = query.status;
  if (query.type) where.type = query.type;

  const [data, total] = await Promise.all([
    prisma.fireExtinguisher.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: extinguisherInclude,
    }),
    prisma.fireExtinguisher.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, { page, limit });
}

export async function getById(id, user) {
  const extinguisher = await prisma.fireExtinguisher.findUnique({
    where: { id },
    include: {
      ...extinguisherInclude,
      inspections: { orderBy: { scheduledDate: 'desc' }, take: 10 },
      maintenanceLogs: { orderBy: { maintenanceDate: 'desc' }, take: 10 },
    },
  });

  if (!extinguisher) {
    throw new AppError('Fire extinguisher not found', 404);
  }

  assertInspectorCanAccessExtinguisher(extinguisher, user);
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

function pickExtinguisherFields(data) {
  const fields = {
    serialNumber: data.serialNumber,
    location: data.location,
    type: data.type,
    size: data.size,
    status: data.status,
  };
  if (data.installationDate) fields.installationDate = new Date(data.installationDate);
  if (data.expiryDate) fields.expiryDate = new Date(data.expiryDate);
  return fields;
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

  if (data.assignedInspectorId) {
    await validateInspectorId(data.assignedInspectorId);
  }

  return prisma.fireExtinguisher.create({
    data: {
      serialNumber: data.serialNumber,
      location: data.location,
      type: data.type,
      size: data.size,
      installationDate,
      expiryDate,
      status: data.status || 'ACTIVE',
      registeredBy: userId,
      assignedInspectorId: data.assignedInspectorId || null,
    },
    include: extinguisherInclude,
  });
}

export async function update(id, data, user) {
  const current = await prisma.fireExtinguisher.findUnique({ where: { id } });
  if (!current) {
    throw new AppError('Fire extinguisher not found', 404);
  }

  assertInspectorCanAccessExtinguisher(current, user);

  if (data.serialNumber) {
    const existing = await prisma.fireExtinguisher.findFirst({
      where: { serialNumber: data.serialNumber, NOT: { id } },
    });
    if (existing) {
      throw new AppError('Serial number already in use', 409);
    }
  }

  const payload = pickExtinguisherFields(data);

  if (user?.role === 'INSPECTOR') {
    delete payload.serialNumber;
  }

  if (user?.role === 'ADMIN' && 'assignedInspectorId' in data) {
    if (data.assignedInspectorId) {
      await validateInspectorId(data.assignedInspectorId);
    }
    payload.assignedInspectorId = data.assignedInspectorId || null;
  }

  const installationDate = payload.installationDate ?? current.installationDate;
  const expiryDate = payload.expiryDate ?? current.expiryDate;
  ensureExpiryAfterInstallation(installationDate, expiryDate);

  return prisma.fireExtinguisher.update({
    where: { id },
    data: payload,
    include: extinguisherInclude,
  });
}

export async function assignInspector(id, inspectorId) {
  const exists = await prisma.fireExtinguisher.findUnique({ where: { id } });
  if (!exists) {
    throw new AppError('Fire extinguisher not found', 404);
  }

  if (inspectorId) {
    await validateInspectorId(inspectorId);
  }

  return prisma.fireExtinguisher.update({
    where: { id },
    data: { assignedInspectorId: inspectorId || null },
    include: extinguisherInclude,
  });
}

export async function remove(id) {
  await prisma.fireExtinguisher.findUniqueOrThrow({ where: { id } });
  await prisma.fireExtinguisher.delete({ where: { id } });
  return { message: 'Fire extinguisher deleted successfully' };
}
