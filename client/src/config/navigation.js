import {
  LayoutDashboard,
  Flame,
  ClipboardCheck,
  Wrench,
  BarChart3,
  Users,
  UserCircle,
} from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true, icon: LayoutDashboard, roles: ['ADMIN', 'INSPECTOR', 'USER'] },
  { to: '/extinguishers', label: 'Extinguishers', icon: Flame, roles: ['ADMIN', 'INSPECTOR', 'USER'] },
  { to: '/inspections', label: 'Inspections', icon: ClipboardCheck, roles: ['ADMIN', 'INSPECTOR', 'USER'] },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ['ADMIN', 'INSPECTOR', 'USER'] },
  { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['ADMIN', 'INSPECTOR', 'USER'] },
  { to: '/admin/users', label: 'Users', icon: Users, roles: ['ADMIN'] },
  { to: '/profile', label: 'Profile', icon: UserCircle, roles: ['ADMIN', 'INSPECTOR', 'USER'] },
];
