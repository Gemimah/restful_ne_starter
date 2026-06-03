import { prisma } from '../config/database.js';
import { AppError } from './AppError.js';

export async function validateInspectorId(inspectorId) {
  if (!inspectorId) return;
  const user = await prisma.user.findUnique({ where: { id: inspectorId } });
  if (!user || user.role !== 'INSPECTOR') {
    throw new AppError('Assigned user must be an inspector', 400);
  }
}

export function inspectorExtinguisherFilter(user) {
  if (user?.role === 'INSPECTOR') {
    return { assignedInspectorId: user.id };
  }
  return {};
}

export function assertInspectorCanAccessExtinguisher(extinguisher, user) {
  if (user?.role === 'INSPECTOR' && extinguisher.assignedInspectorId !== user.id) {
    throw new AppError('This extinguisher is not assigned to you', 403);
  }
}

export const extinguisherInclude = {
  assignedInspector: { select: { id: true, firstName: true, lastName: true, email: true } },
  _count: { select: { inspections: true, maintenanceLogs: true } },
};
