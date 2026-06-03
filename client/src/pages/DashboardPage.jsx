import { useEffect, useState } from 'react';
import { LayoutDashboard, Flame, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { reportService } from '../services/report.service.js';
import { RoleDashboardCharts } from '../components/dashboard/DashboardCharts.jsx';
import PageHeader from '../components/PageHeader.jsx';

function KpiCard({ title, value, color, icon: Icon }) {
  return (
    <div className={`rounded-xl border p-5 shadow-sm ${color}`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium opacity-80">{title}</h3>
        {Icon && <Icon className="h-5 w-5 shrink-0 opacity-50" strokeWidth={2} aria-hidden />}
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function kpiCardsForRole(role, stats) {
  const inv = stats?.inventory;
  const insp = stats?.inspections;
  const comp = stats?.compliance;

  const all = [
    { title: 'Total Extinguishers', value: inv?.total ?? '—', color: 'bg-red-50 text-red-700 border-red-100', icon: Flame },
    { title: 'Pending Inspections', value: insp?.pending ?? '—', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: Clock },
    { title: 'Overdue Inspections', value: insp?.overdue ?? '—', color: 'bg-orange-50 text-orange-700 border-orange-100', icon: AlertTriangle },
    {
      title: 'Compliance',
      value: comp?.complianceStatus ?? '—',
      color: 'bg-green-50 text-green-700 border-green-100',
      icon: ShieldCheck,
    },
  ];

  if (role === 'USER') {
    return [
      { title: 'Pending Inspections', value: insp?.pending ?? '—', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: Clock },
      { title: 'Overdue Inspections', value: insp?.overdue ?? '—', color: 'bg-orange-50 text-orange-700 border-orange-100', icon: AlertTriangle },
      {
        title: 'Compliance rate',
        value: comp?.complianceRate != null ? `${comp.complianceRate}%` : '—',
        color: 'bg-green-50 text-green-700 border-green-100',
        icon: ShieldCheck,
      },
    ];
  }

  return all;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    reportService
      .dashboard()
      .then(({ data }) => {
        if (!cancelled) {
          setStats(data?.data ?? null);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          toast.error('Could not load dashboard data. Is the reporting service running?');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const role = user?.role ?? 'USER';
  const cards = kpiCardsForRole(role, stats);

  return (
    <div>
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        subtitle={`Welcome, ${user?.firstName || user?.email || 'User'} — role: ${role}`}
      />

      {loading && (
        <p className="mt-8 text-sm text-slate-500">Loading dashboard...</p>
      )}

      {!loading && error && (
        <p className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Charts are hidden until report data loads. Check that all services are running (`npm run dev`).
        </p>
      )}

      {!loading && (
        <>
          <div
            className={`mt-8 grid gap-4 sm:grid-cols-2 ${
              role === 'USER' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
            }`}
          >
            {cards.map((card) => (
              <KpiCard key={card.title} {...card} />
            ))}
          </div>

          {!error && stats && <RoleDashboardCharts role={role} stats={stats} />}
        </>
      )}
    </div>
  );
}
