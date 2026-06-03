import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { reportService } from '../services/report.service.js';

export default function ReportsPage() {
  const { user } = useAuth();
  const canExport = ['ADMIN', 'INSPECTOR'].includes(user?.role);
  const [reports, setReports] = useState(null);

  useEffect(() => {
    reportService.dashboard().then(({ data }) => setReports(data.data)).catch(() => {});
  }, []);

  const download = async (type, format) => {
    try {
      const fn = format === 'csv' ? reportService.exportCsv : reportService.exportPdf;
      const { data } = await fn(type);
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report.${format}`;
      a.click();
      toast.success(`${format.toUpperCase()} downloaded`);
    } catch {
      toast.error('Export failed');
    }
  };

  if (!reports) return <p>Loading reports...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold">Real-Time Reports</h2>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <ReportCard title="Inventory" data={reports.inventory} fields={[
          ['Total', reports.inventory.total],
          ['Daily', reports.inventory.dailySummary],
          ['Monthly', reports.inventory.monthlySummary],
          ['Yearly', reports.inventory.yearlySummary],
        ]} canExport={canExport} onExport={(f) => download('inventory', f)} />

        <ReportCard title="Inspections" data={reports.inspections} fields={[
          ['Pending', reports.inspections.pending],
          ['Completed', reports.inspections.completed],
          ['Overdue', reports.inspections.overdue],
        ]} canExport={canExport} onExport={(f) => download('inspections', f)} />

        <ReportCard title="Compliance" data={reports.compliance} fields={[
          ['Status', reports.compliance.complianceStatus],
          ['Rate', `${reports.compliance.complianceRate}%`],
          ['Expired', reports.compliance.expiredCount],
          ['Needs Inspection', reports.compliance.needsInspectionCount],
        ]} canExport={canExport} onExport={(f) => download('compliance', f)} />

        <ReportCard title="Maintenance" data={reports.maintenance} fields={[
          ['Total Records', reports.maintenance.totalMaintenanceRecords],
          ['Recent', reports.maintenance.recentActivities?.length ?? 0],
        ]} canExport={canExport} onExport={(f) => download('maintenance', f)} />
      </div>
    </div>
  );
}

function ReportCard({ title, fields, canExport, onExport }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <dl className="mt-3 space-y-1 text-sm">
        {fields.map(([label, value]) => (
          <div key={label} className="flex justify-between">
            <dt className="text-slate-500">{label}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      {canExport && (
        <div className="mt-4 flex gap-2">
          <button onClick={() => onExport('csv')} className="rounded bg-slate-100 px-3 py-1 text-xs font-medium hover:bg-slate-200">CSV</button>
          <button onClick={() => onExport('pdf')} className="rounded bg-slate-100 px-3 py-1 text-xs font-medium hover:bg-slate-200">PDF</button>
        </div>
      )}
    </div>
  );
}
