import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/auth.service.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Mail, Lock, LogIn } from 'lucide-react';
import AuthShell, { AuthFooterLink } from '../components/auth/AuthShell.jsx';
import IconInput from '../components/ui/IconInput.jsx';
import { authButton, authLabel, authLink } from '../components/auth/authStyles.js';

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
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage extinguishers, inspections, and compliance reports."
      footer={<AuthFooterLink text="No account?" linkText="Create one" to="/register" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={authLabel}>Email</label>
          <IconInput
            icon={Mail}
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className={authLabel}>Password</label>
          <IconInput
            icon={Lock}
            type="password"
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <p className="text-right text-sm">
          <Link to="/forgot-password" className={authLink}>
            Forgot password?
          </Link>
        </p>
        <button type="submit" disabled={loading} className={`${authButton} inline-flex items-center justify-center gap-2`}>
          <LogIn className="h-4 w-4" aria-hidden />
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  );
}
