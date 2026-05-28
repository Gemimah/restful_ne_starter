import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
      <p className="mt-2 text-slate-600">
        Welcome, {user?.name || user?.email}! Your starter template is ready.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: 'Auth', desc: 'JWT + OTP already wired' },
          { title: 'API', desc: 'Swagger at /api-docs' },
          { title: 'CRUD', desc: 'Sample Items module — rename for exam' },
        ].map((card) => (
          <div key={card.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900">{card.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
