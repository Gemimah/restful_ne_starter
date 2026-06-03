import PDFDocument from 'pdfkit';
import * as reportService from '../services/report.service.js';

export async function inventory(req, res, next) {
  try {
    const data = await reportService.getInventoryReport();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function inspections(req, res, next) {
  try {
    const data = await reportService.getInspectionReport();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function compliance(req, res, next) {
  try {
    const data = await reportService.getComplianceReport();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function maintenance(req, res, next) {
  try {
    const data = await reportService.getMaintenanceReport();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function dashboard(req, res, next) {
  try {
    const data = await reportService.getDashboardSummary();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function exportCsv(req, res, next) {
  try {
    const { type } = req.params;
    let csv = '';
    let filename = 'report.csv';

    if (type === 'inventory') {
      const rows = await import('../config/database.js').then(({ prisma }) =>
        prisma.fireExtinguisher.findMany({ orderBy: { serialNumber: 'asc' } })
      );
      csv = reportService.toCsv(rows, [
        { label: 'Serial Number', key: 'serialNumber' },
        { label: 'Location', key: 'location' },
        { label: 'Type', key: 'type' },
        { label: 'Size', key: 'size' },
        { label: 'Status', key: 'status' },
        { label: 'Expiry Date', key: (r) => r.expiryDate.toISOString().split('T')[0] },
      ]);
      filename = 'inventory-report.csv';
    } else if (type === 'inspections') {
      const data = await reportService.getInspectionReport();
      csv = reportService.toCsv(data.recent, [
        { label: 'Status', key: 'status' },
        { label: 'Date', key: (r) => r.scheduledDate.toISOString().split('T')[0] },
        { label: 'Time', key: 'scheduledTime' },
        { label: 'Serial', key: (r) => r.extinguisher?.serialNumber },
        { label: 'Location', key: (r) => r.extinguisher?.location },
      ]);
      filename = 'inspection-report.csv';
    } else if (type === 'maintenance') {
      const data = await reportService.getMaintenanceReport();
      csv = reportService.toCsv(data.recentActivities, [
        { label: 'Action', key: 'actionTaken' },
        { label: 'Date', key: (r) => r.maintenanceDate.toISOString().split('T')[0] },
        { label: 'Serial', key: (r) => r.extinguisher?.serialNumber },
        { label: 'Issues', key: 'issuesIdentified' },
        { label: 'Notes', key: 'notes' },
      ]);
      filename = 'maintenance-report.csv';
    } else if (type === 'compliance') {
      const data = await reportService.getComplianceReport();
      csv = reportService.toCsv(data.expired, [
        { label: 'Serial', key: 'serialNumber' },
        { label: 'Location', key: 'location' },
        { label: 'Expiry', key: (r) => r.expiryDate.toISOString().split('T')[0] },
        { label: 'Status', key: 'status' },
      ]);
      filename = 'compliance-report.csv';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid report type' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
}

export async function exportPdf(req, res, next) {
  try {
    const { type } = req.params;
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-report.pdf"`);
      res.send(Buffer.concat(chunks));
    });

    doc.fontSize(18).text('TZW LTD — Fire Extinguisher Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Report Type: ${type.toUpperCase()}`);
    doc.text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown();

    let data;
    if (type === 'inventory') data = await reportService.getInventoryReport();
    else if (type === 'inspections') data = await reportService.getInspectionReport();
    else if (type === 'compliance') data = await reportService.getComplianceReport();
    else if (type === 'maintenance') data = await reportService.getMaintenanceReport();
    else {
      doc.text('Invalid report type');
      doc.end();
      return;
    }

    doc.text(JSON.stringify(data, null, 2));
    doc.end();
  } catch (error) {
    next(error);
  }
}
