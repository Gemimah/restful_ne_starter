import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/items', label: 'Items' }, // EXAM TIP: Rename route + label
];

export default function Sidebar() {
  return (
    <aside className="w-56 border-r border-slate-200 bg-white">
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Menu</p>
      </div>
      <nav className="space-y-1 px-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
