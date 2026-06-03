import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/auth.service.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.login(form);
      login(data.token, data.user);
      toast.success('Welcome back!');
      navigate('/');
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-8 shadow-lg">
      <h2 className="mb-2 text-2xl font-bold text-slate-900">TZW LTD</h2>
      <p className="mb-6 text-sm text-slate-500">Fire Extinguisher Management — Sign in</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input type="email" required className="w-full rounded-lg border px-3 py-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input type="password" required className="w-full rounded-lg border px-3 py-2" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-red-600 py-2.5 font-medium text-white hover:bg-red-700 disabled:opacity-50">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="mt-3 text-center text-sm">
        <Link to="/forgot-password" className="text-red-600 hover:underline">Forgot password?</Link>
      </p>
      <p className="mt-2 text-center text-sm text-slate-600">
        No account? <Link to="/register" className="font-medium text-red-600">Register</Link>
      </p>
    </div>
  );
}
