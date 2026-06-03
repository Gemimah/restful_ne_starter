import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { reportService } from '../services/report.service.js';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    reportService.dashboard().then(({ data }) => setStats(data.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
      <p className="mt-2 text-slate-600">
        Welcome, {user?.firstName || user?.name || user?.email}! Role: <span className="font-medium text-red-600">{user?.role}</span>
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Extinguishers', value: stats?.inventory?.total ?? '—', color: 'bg-red-50 text-red-700' },
          { title: 'Pending Inspections', value: stats?.inspections?.pending ?? '—', color: 'bg-amber-50 text-amber-700' },
          { title: 'Overdue Inspections', value: stats?.inspections?.overdue ?? '—', color: 'bg-orange-50 text-orange-700' },
          { title: 'Compliance', value: stats?.compliance?.complianceStatus ?? '—', color: 'bg-green-50 text-green-700' },
        ].map((card) => (
          <div key={card.title} className={`rounded-xl border p-5 shadow-sm ${card.color}`}>
            <h3 className="text-sm font-medium opacity-80">{card.title}</h3>
            <p className="mt-2 text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
