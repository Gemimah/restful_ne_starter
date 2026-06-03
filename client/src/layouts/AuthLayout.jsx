import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthStoryPanel from '../components/auth/AuthStoryPanel.jsx';

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left — storytelling (desktop) */}
      <div className="hidden flex-1 lg:block">
        <AuthStoryPanel />
      </div>

      {/* Right — form */}
      <div className="flex w-full flex-col justify-center bg-white px-6 py-10 sm:px-10 lg:w-[48%] lg:max-w-[560px] lg:shrink-0 lg:px-14 xl:max-w-[600px]">
        <div className="mx-auto w-full max-w-md lg:mr-8 lg:ml-auto xl:mr-14">
          <Outlet />
        </div>
      </div>

      {/* Mobile — slim brand strip */}
      <div className="border-t border-slate-200 bg-gradient-to-r from-[#0f2744] to-[#1a4a6e] px-6 py-4 lg:hidden">
        <p className="text-center text-xs text-sky-100">
          TZW LTD — Fire extinguisher management for compliant, safer workplaces
        </p>
      </div>
    </div>
  );
}
