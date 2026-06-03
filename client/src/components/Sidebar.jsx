import { NavLink } from 'react-router-dom';
import { Flame, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { NAV_ITEMS } from '../config/navigation.js';

export default function Sidebar() {
  const { user } = useAuth();
  const links = NAV_ITEMS.filter((l) => l.roles.includes(user?.role));

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
            <Flame className="h-5 w-5 text-red-400" strokeWidth={2} aria-hidden />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-white">TZW LTD</p>
            <p className="text-[11px] font-medium text-sky-200/90">Fire Safety</p>
          </div>
        </div>
      </div>

      <nav className="relative flex-1 space-y-0.5 p-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-red-600/90 text-white shadow-sm'
                    : 'text-sky-100/90 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0 opacity-90" strokeWidth={2} aria-hidden />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="relative flex items-center gap-2 border-t border-white/10 px-4 py-3">
        <UserCircle className="h-8 w-8 shrink-0 text-sky-200/80" strokeWidth={1.5} aria-hidden />
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-sky-100">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-sky-200/50">{user?.role}</p>
        </div>
      </div>
    </aside>
  );
}
