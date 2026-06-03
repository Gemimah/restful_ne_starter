import { prisma } from '../config/database.js';

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfYear(date) {
  return new Date(date.getFullYear(), 0, 1);
}

export async function getInventoryReport() {
  const now = new Date();
  const [total, daily, monthly, yearly, byType, byStatus] = await Promise.all([
    prisma.fireExtinguisher.count(),
    prisma.fireExtinguisher.count({ where: { createdAt: { gte: startOfDay(now) } } }),
    prisma.fireExtinguisher.count({ where: { createdAt: { gte: startOfMonth(now) } } }),
    prisma.fireExtinguisher.count({ where: { createdAt: { gte: startOfYear(now) } } }),
    prisma.fireExtinguisher.groupBy({ by: ['type'], _count: { type: true } }),
    prisma.fireExtinguisher.groupBy({ by: ['status'], _count: { status: true } }),
  ]);

  return {
    total,
    dailySummary: daily,
    monthlySummary: monthly,
    yearlySummary: yearly,
    byType: byType.map((r) => ({ type: r.type, count: r._count.type })),
    byStatus: byStatus.map((r) => ({ status: r.status, count: r._count.status })),
    generatedAt: now.toISOString(),
  };
}

export async function getInspectionReport() {
  const now = new Date();
  await prisma.inspection.updateMany({
    where: { status: 'PENDING', scheduledDate: { lt: now } },
    data: { status: 'OVERDUE' },
  });

  const [pending, completed, overdue] = await Promise.all([
    prisma.inspection.count({ where: { status: 'PENDING' } }),
    prisma.inspection.count({ where: { status: 'COMPLETED' } }),
    prisma.inspection.count({ where: { status: 'OVERDUE' } }),
  ]);

  const recent = await prisma.inspection.findMany({
    take: 20,
    orderBy: { scheduledDate: 'desc' },
    include: { extinguisher: { select: { serialNumber: true, location: true } } },
  });

  return { pending, completed, overdue, recent, generatedAt: now.toISOString() };
}

export async function getComplianceReport() {
  const now = new Date();
  const thirtyDays = new Date(now);
  thirtyDays.setDate(thirtyDays.getDate() + 30);

  const [expired, upcoming, active, needsInspection] = await Promise.all([
    prisma.fireExtinguisher.findMany({ where: { expiryDate: { lt: now } }, orderBy: { expiryDate: 'asc' } }),
    prisma.fireExtinguisher.findMany({
      where: { expiryDate: { gte: now, lte: thirtyDays } },
      orderBy: { expiryDate: 'asc' },
    }),
    prisma.fireExtinguisher.count({ where: { status: 'ACTIVE' } }),
    prisma.fireExtinguisher.count({ where: { status: 'NEEDS_INSPECTION' } }),
  ]);

  const complianceRate = expired.length === 0
    ? 100
    : Math.round(((await prisma.fireExtinguisher.count()) - expired.length) / (await prisma.fireExtinguisher.count() || 1) * 100);

  return {
    expiredCount: expired.length,
    expired,
    upcomingExpirations: upcoming,
    activeCount: active,
    needsInspectionCount: needsInspection,
    complianceStatus: complianceRate >= 80 ? 'COMPLIANT' : 'AT_RISK',
    complianceRate,
    generatedAt: now.toISOString(),
  };
}

export async function getMaintenanceReport() {
  const logs = await prisma.maintenanceLog.findMany({
    orderBy: { maintenanceDate: 'desc' },
    include: { extinguisher: { select: { serialNumber: true, location: true } } },
  });

  const frequency = await prisma.maintenanceLog.groupBy({
    by: ['extinguisherId'],
    _count: { extinguisherId: true },
  });

  const recent = logs.slice(0, 20);

  return {
    totalMaintenanceRecords: logs.length,
    maintenanceFrequency: frequency.map((f) => ({ extinguisherId: f.extinguisherId, count: f._count.extinguisherId })),
    recentActivities: recent,
    generatedAt: new Date().toISOString(),
  };
}

export async function getDashboardSummary() {
  const [inventory, inspections, compliance, maintenance] = await Promise.all([
    getInventoryReport(),
    getInspectionReport(),
    getComplianceReport(),
    getMaintenanceReport(),
  ]);

  return { inventory, inspections, compliance, maintenance };
}

export function toCsv(rows, columns) {
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const header = columns.map((c) => escape(c.label)).join(',');
  const lines = rows.map((row) => columns.map((c) => escape(typeof c.key === 'function' ? c.key(row) : row[c.key])).join(','));
  return `\uFEFF${[header, ...lines].join('\r\n')}`;
}

export function cellValue(row, col) {
  const raw = typeof col.key === 'function' ? col.key(row) : row[col.key];
  return raw == null ? '' : String(raw);
}

/** Shared data for CSV + PDF exports */
export async function getExportPayload(type) {
  const generatedAt = new Date().toLocaleString();

  if (type === 'inventory') {
    const [summary, rows] = await Promise.all([
      getInventoryReport(),
      prisma.fireExtinguisher.findMany({ orderBy: { serialNumber: 'asc' } }),
    ]);
    const columns = [
      { label: 'Serial Number', key: 'serialNumber', width: 16 },
      { label: 'Location', key: 'location', width: 22 },
      { label: 'Type', key: 'type', width: 14 },
      { label: 'Size', key: 'size', width: 10 },
      { label: 'Status', key: 'status', width: 18 },
      { label: 'Expiry', key: (r) => r.expiryDate.toISOString().split('T')[0], width: 12 },
    ];
    return {
      title: 'Inventory Report',
      filenameBase: 'inventory-report',
      summaryLines: [
        `Generated: ${generatedAt}`,
        `Total extinguishers: ${summary.total}`,
        `Added today: ${summary.dailySummary} | This month: ${summary.monthlySummary} | This year: ${summary.yearlySummary}`,
      ],
      columns,
      rows,
    };
  }

  if (type === 'inspections') {
    const data = await getInspectionReport();
    const columns = [
      { label: 'Status', key: 'status', width: 12 },
      { label: 'Date', key: (r) => r.scheduledDate.toISOString().split('T')[0], width: 12 },
      { label: 'Time', key: 'scheduledTime', width: 8 },
      { label: 'Serial', key: (r) => r.extinguisher?.serialNumber, width: 14 },
      { label: 'Location', key: (r) => r.extinguisher?.location, width: 22 },
      { label: 'Notes', key: 'notes', width: 20 },
    ];
    return {
      title: 'Inspection Report',
      filenameBase: 'inspection-report',
      summaryLines: [
        `Generated: ${generatedAt}`,
        `Pending: ${data.pending} | Completed: ${data.completed} | Overdue: ${data.overdue}`,
      ],
      columns,
      rows: data.recent,
    };
  }

  if (type === 'compliance') {
    const data = await getComplianceReport();
    const columns = [
      { label: 'Serial', key: 'serialNumber', width: 14 },
      { label: 'Location', key: 'location', width: 22 },
      { label: 'Expiry', key: (r) => r.expiryDate.toISOString().split('T')[0], width: 12 },
      { label: 'Status', key: 'status', width: 18 },
    ];
    return {
      title: 'Compliance Report (Expired Units)',
      filenameBase: 'compliance-report',
      summaryLines: [
        `Generated: ${generatedAt}`,
        `Compliance: ${data.complianceStatus} (${data.complianceRate}%)`,
        `Expired: ${data.expiredCount} | Needs inspection: ${data.needsInspectionCount} | Active: ${data.activeCount}`,
      ],
      columns,
      rows: data.expired,
    };
  }

  if (type === 'maintenance') {
    const data = await getMaintenanceReport();
    const columns = [
      { label: 'Date', key: (r) => r.maintenanceDate.toISOString().split('T')[0], width: 12 },
      { label: 'Serial', key: (r) => r.extinguisher?.serialNumber, width: 14 },
      { label: 'Location', key: (r) => r.extinguisher?.location, width: 20 },
      { label: 'Action', key: 'actionTaken', width: 24 },
      { label: 'Issues', key: 'issuesIdentified', width: 18 },
      { label: 'Notes', key: 'notes', width: 18 },
    ];
    return {
      title: 'Maintenance Report',
      filenameBase: 'maintenance-report',
      summaryLines: [
        `Generated: ${generatedAt}`,
        `Total maintenance records: ${data.totalMaintenanceRecords}`,
      ],
      columns,
      rows: data.recentActivities,
    };
  }

  return null;
}

export function formatTextTable(columns, rows) {
  if (!rows.length) return '(No records)';
  const widths = columns.map((c) => c.width || 14);
  const pad = (text, w) => {
    const s = String(text ?? '');
    return s.length > w ? `${s.slice(0, w - 1)}…` : s.padEnd(w);
  };
  const header = columns.map((c, i) => pad(c.label, widths[i])).join(' ');
  const divider = widths.map((w) => '-'.repeat(w)).join(' ');
  const body = rows.map((row) => columns.map((c, i) => pad(cellValue(row, c), widths[i])).join(' '));
  return [header, divider, ...body].join('\n');
}
