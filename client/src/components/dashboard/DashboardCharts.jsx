import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartCard, { ChartEmpty } from './ChartCard.jsx';

const COLORS = ['#dc2626', '#f59e0b', '#ea580c', '#16a34a', '#2563eb', '#7c3aed', '#64748b'];

function formatLabel(value) {
  return String(value ?? '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function toChartRows(items, nameKey = 'name', valueKey = 'value') {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (item == null) return null;
      const name = item[nameKey] ?? item.type ?? item.status ?? item.label ?? 'Unknown';
      const value = Number(item[valueKey] ?? item.count ?? item.value ?? 0);
      if (Number.isNaN(value)) return null;
      return { name: formatLabel(name), value };
    })
    .filter(Boolean);
}

function hasPositiveValues(rows) {
  return rows.some((r) => r.value > 0);
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-slate-800">{item.name}</p>
      <p className="text-slate-600">{item.value}</p>
    </div>
  );
}

export function ExtinguisherStatusPie({ byStatus }) {
  const data = toChartRows(
    (byStatus ?? []).map((r) => ({ name: r.status, value: r.count })),
    'name',
    'value'
  );

  return (
    <ChartCard title="Extinguishers by status" subtitle="Current inventory breakdown">
      {!hasPositiveValues(data) ? (
        <ChartEmpty />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={88} label>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function ExtinguisherTypeBar({ byType }) {
  const data = toChartRows(
    (byType ?? []).map((r) => ({ name: r.type, value: r.count })),
    'name',
    'value'
  );

  return (
    <ChartCard title="Extinguishers by type" subtitle="CO2, water, foam, etc.">
      {!hasPositiveValues(data) ? (
        <ChartEmpty />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={50} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="value" fill="#dc2626" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function InspectionStatusBar({ inspections }) {
  const pending = Number(inspections?.pending ?? 0);
  const completed = Number(inspections?.completed ?? 0);
  const overdue = Number(inspections?.overdue ?? 0);

  const data = [
    { name: 'Pending', value: pending },
    { name: 'Completed', value: completed },
    { name: 'Overdue', value: overdue },
  ];

  return (
    <ChartCard title="Inspection overview" subtitle="Pending, completed, and overdue">
      {!hasPositiveValues(data) ? (
        <ChartEmpty message="No inspections recorded yet" />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.name === 'Overdue' ? '#ea580c' : entry.name === 'Pending' ? '#f59e0b' : '#16a34a'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function CompliancePie({ compliance }) {
  const rate = Math.min(100, Math.max(0, Number(compliance?.complianceRate ?? 0)));
  const expired = Number(compliance?.expiredCount ?? 0);
  const needs = Number(compliance?.needsInspectionCount ?? 0);
  const active = Number(compliance?.activeCount ?? 0);

  const data =
    expired + needs + active > 0
      ? [
          { name: 'Active', value: active },
          { name: 'Needs inspection', value: needs },
          { name: 'Expired', value: expired },
        ].filter((d) => d.value > 0)
      : [
          { name: 'Compliant', value: rate },
          { name: 'At risk', value: Math.max(0, 100 - rate) },
        ].filter((d) => d.value > 0);

  return (
    <ChartCard
      title="Compliance snapshot"
      subtitle={
        compliance?.complianceStatus
          ? `${compliance.complianceStatus} — ${rate}% compliance rate`
          : 'Fleet compliance'
      }
    >
      {!hasPositiveValues(data) ? (
        <ChartEmpty />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={88} label>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function MaintenanceSummaryBar({ maintenance, className = '' }) {
  const total = Number(maintenance?.totalMaintenanceRecords ?? 0);
  const recent = Array.isArray(maintenance?.recentActivities) ? maintenance.recentActivities.length : 0;

  const data = [
    { name: 'Total logs', value: total },
    { name: 'Recent (shown)', value: recent },
  ];

  return (
    <ChartCard title="Maintenance activity" subtitle="Recorded service history" className={className}>
      {total === 0 ? (
        <ChartEmpty message="No maintenance logs yet" />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

/** Role-based chart grid — safe if stats is null */
export function RoleDashboardCharts({ role, stats }) {
  if (!stats) return null;

  const inventory = stats.inventory ?? {};
  const inspections = stats.inspections ?? {};
  const compliance = stats.compliance ?? {};
  const maintenance = stats.maintenance ?? {};

  if (role === 'ADMIN') {
    return (
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <ExtinguisherStatusPie byStatus={inventory.byStatus} />
        <ExtinguisherTypeBar byType={inventory.byType} />
        <InspectionStatusBar inspections={inspections} />
        <CompliancePie compliance={compliance} />
        <MaintenanceSummaryBar maintenance={maintenance} className="lg:col-span-2" />
      </div>
    );
  }

  if (role === 'INSPECTOR') {
    return (
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <InspectionStatusBar inspections={inspections} />
        <CompliancePie compliance={compliance} />
        <ExtinguisherStatusPie byStatus={inventory.byStatus} />
      </div>
    );
  }

  // USER — minimal
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2 lg:max-w-2xl">
      <CompliancePie compliance={compliance} />
      <InspectionStatusBar inspections={inspections} />
    </div>
  );
}
