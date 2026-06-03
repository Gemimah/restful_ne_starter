import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const allLinks = [
  { to: '/', label: 'Dashboard', end: true, roles: ['ADMIN', 'INSPECTOR', 'USER'] },
  { to: '/extinguishers', label: 'Extinguishers', roles: ['ADMIN', 'INSPECTOR', 'USER'] },
  { to: '/inspections', label: 'Inspections', roles: ['ADMIN', 'INSPECTOR', 'USER'] },
  { to: '/maintenance', label: 'Maintenance', roles: ['ADMIN', 'INSPECTOR', 'USER'] },
  { to: '/reports', label: 'Reports', roles: ['ADMIN', 'INSPECTOR', 'USER'] },
  { to: '/admin/users', label: 'Users', roles: ['ADMIN'] },
  { to: '/profile', label: 'Profile', roles: ['ADMIN', 'INSPECTOR', 'USER'] },
];

export default function Sidebar() {
  const { user } = useAuth();
  const links = allLinks.filter((l) => l.roles.includes(user?.role));

  return (
    <aside className="relative flex w-56 shrink-0 flex-col overflow-hidden border-r border-white/10 bg-gradient-to-br from-[#0f2744] via-[#1a4a6e] to-[#1e5c4a] text-white">
      <div
        className="pointer-events-none absolute -right-8 top-1/4 h-40 w-40 rounded-full bg-emerald-400/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-emerald-900/25 to-transparent"
        aria-hidden
      />

      <div className="relative border-b border-white/10 px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2C8.5 2 6 4.5 6 8v2H4v12h16V10h-2V8c0-3.5-2.5-6-6-6zm0 2c2.2 0 4 1.8 4 4v2H8V8c0-2.2 1.8-4 4-4zm-6 8h12v8H6v-8z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-white">TZW LTD</p>
            <p className="text-[11px] font-medium text-sky-200/90">Fire Safety</p>
          </div>
        </div>
      </div>

      <nav className="relative flex-1 space-y-0.5 p-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-red-600/90 text-white shadow-sm'
                  : 'text-sky-100/90 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="relative border-t border-white/10 px-4 py-3">
        <p className="truncate text-xs text-sky-200/70">
          {user?.firstName} {user?.lastName}
        </p>
        <p className="text-[10px] uppercase tracking-wide text-sky-200/50">{user?.role}</p>
      </div>
    </aside>
  );
}
