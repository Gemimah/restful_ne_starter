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
    const payload = await reportService.getExportPayload(type);
    if (!payload) {
      return res.status(400).json({ success: false, message: 'Invalid report type' });
    }

    const csv = reportService.toCsv(payload.rows, payload.columns);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${payload.filenameBase}.csv"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
}

export async function exportPdf(req, res, next) {
  try {
    const { type } = req.params;
    const payload = await reportService.getExportPayload(type);
    if (!payload) {
      return res.status(400).json({ success: false, message: 'Invalid report type' });
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${payload.filenameBase}.pdf"`);
      res.send(Buffer.concat(chunks));
    });

    doc.fontSize(16).text('TZW LTD — Fire Extinguisher Management', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).text(payload.title, { align: 'center' });
    doc.moveDown();

    doc.fontSize(10).fillColor('#333333');
    payload.summaryLines.forEach((line) => {
      doc.text(line);
    });
    doc.moveDown();

    doc.font('Courier').fontSize(8).fillColor('#000000');
    doc.text(reportService.formatTextTable(payload.columns, payload.rows), {
      lineGap: 2,
    });

    doc.end();
  } catch (error) {
    next(error);
  }
}
