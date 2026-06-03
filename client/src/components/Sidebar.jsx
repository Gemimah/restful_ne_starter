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
    <aside className="w-56 border-r border-slate-200 bg-white">
      <div className="border-b p-4">
        <p className="font-bold text-red-600">TZW LTD</p>
        <p className="text-xs text-slate-400">Fire Safety Management</p>
      </div>
      <nav className="space-y-1 p-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50'}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
