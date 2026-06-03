import { LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to log out? You will need to sign in again to access the system.'
    );
    if (!confirmed) return;

    await logout();
    toast.success('You have been logged out successfully');
    navigate('/login');
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-[#0f2744]">TZW LTD — Fire Safety</h1>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2 text-sm text-slate-600">
          <User className="h-4 w-4 text-slate-400" strokeWidth={2} aria-hidden />
          {user?.firstName} ({user?.role})
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
        >
          <LogOut className="h-4 w-4" strokeWidth={2} aria-hidden />
          Logout
        </button>
      </div>
    </header>
  );
}
