import { useEffect, useState } from 'react';
import { BarChart3, FileSpreadsheet, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { reportService } from '../services/report.service.js';
import PageHeader from '../components/PageHeader.jsx';

function parseFilename(contentDisposition, fallback) {
  if (!contentDisposition) return fallback;
  const match = /filename\*?=(?:UTF-8'')?"?([^";\n]+)"?/i.exec(contentDisposition);
  return match ? match[1].trim() : fallback;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const canExport = ['ADMIN', 'INSPECTOR'].includes(user?.role);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService
      .dashboard()
      .then(({ data }) => setReports(data.data))
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  const download = async (type, format) => {
    try {
      const response =
        format === 'csv' ? await reportService.exportCsv(type) : await reportService.exportPdf(type);

      const contentType = response.headers['content-type'] || '';

      if (!contentType.includes(format === 'csv' ? 'csv' : 'pdf')) {
        toast.error('Export failed — server returned an unexpected format. Are all services running?');
        return;
      }

      const fallbackName = `${type}-report.${format}`;
      const filename = parseFilename(response.headers['content-disposition'], fallbackName);
      const mime = format === 'csv' ? 'text/csv;charset=utf-8' : 'application/pdf';
      const blob = new Blob([response.data], { type: mime });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${format.toUpperCase()} downloaded: ${filename}`);
    } catch {
      toast.error('Export failed');
    }
  };

  if (loading) return <p className="text-slate-600">Loading reports...</p>;
  if (!reports) return <p className="text-red-600">Could not load reports.</p>;

  return (
    <div>
      <PageHeader
        icon={BarChart3}
        title="Real-Time Reports"
        subtitle="Live summaries from the database. Export as CSV (Excel) or PDF."
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <ReportCard
          title="Inventory"
          fields={[
            ['Total', reports.inventory.total],
            ['Added today', reports.inventory.dailySummary],
            ['This month', reports.inventory.monthlySummary],
            ['This year', reports.inventory.yearlySummary],
          ]}
          breakdown={reports.inventory.byStatus}
          breakdownLabel="By status"
          canExport={canExport}
          onExport={download}
          exportType="inventory"
        />

        <ReportCard
          title="Inspections"
          fields={[
            ['Pending', reports.inspections.pending],
            ['Completed', reports.inspections.completed],
            ['Overdue', reports.inspections.overdue],
          ]}
          table={{
            headers: ['Status', 'Date', 'Serial', 'Location'],
            rows: (reports.inspections.recent || []).slice(0, 5).map((r) => [
              r.status,
              r.scheduledDate?.slice(0, 10),
              r.extinguisher?.serialNumber ?? '—',
              r.extinguisher?.location ?? '—',
            ]),
          }}
          canExport={canExport}
          onExport={download}
          exportType="inspections"
        />

        <ReportCard
          title="Compliance"
          fields={[
            ['Status', reports.compliance.complianceStatus],
            ['Rate', `${reports.compliance.complianceRate}%`],
            ['Expired units', reports.compliance.expiredCount],
            ['Needs inspection', reports.compliance.needsInspectionCount],
          ]}
          table={{
            headers: ['Serial', 'Location', 'Expiry'],
            rows: (reports.compliance.expired || []).slice(0, 5).map((r) => [
              r.serialNumber,
              r.location,
              r.expiryDate?.slice(0, 10),
            ]),
          }}
          canExport={canExport}
          onExport={download}
          exportType="compliance"
        />

        <ReportCard
          title="Maintenance"
          fields={[['Total records', reports.maintenance.totalMaintenanceRecords]]}
          table={{
            headers: ['Date', 'Serial', 'Action'],
            rows: (reports.maintenance.recentActivities || []).slice(0, 5).map((r) => [
              r.maintenanceDate?.slice(0, 10),
              r.extinguisher?.serialNumber ?? '—',
              r.actionTaken,
            ]),
          }}
          canExport={canExport}
          onExport={download}
          exportType="maintenance"
        />
      </div>
    </div>
  );
}

function ReportCard({ title, fields, breakdown, breakdownLabel, table, canExport, onExport, exportType }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <dl className="mt-3 space-y-1 text-sm">
        {fields.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-slate-500">{label}</dt>
            <dd className="font-medium text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>

      {breakdown?.length > 0 && (
        <div className="mt-3 border-t pt-3 text-xs text-slate-600">
          <p className="mb-1 font-medium text-slate-700">{breakdownLabel}</p>
          {breakdown.map((item) => (
            <div key={item.status} className="flex justify-between">
              <span>{item.status}</span>
              <span>{item.count}</span>
            </div>
          ))}
        </div>
      )}

      {table && (
        <div className="mt-3 overflow-x-auto border-t pt-3">
          {table.rows.length === 0 ? (
            <p className="text-xs text-slate-500">No detail records yet.</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-500">
                  {table.headers.map((h) => (
                    <th key={h} className="pb-1 pr-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    {row.map((cell, j) => (
                      <td key={j} className="py-1 pr-2 text-slate-800">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {canExport && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onExport(exportType, 'csv')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden />
            CSV (Excel)
          </button>
          <button
            type="button"
            onClick={() => onExport(exportType, 'pdf')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <FileText className="h-3.5 w-3.5" aria-hidden />
            PDF
          </button>
        </div>
      )}
    </div>
  );
}
