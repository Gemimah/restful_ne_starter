import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}
