import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/auth.service.js';
import AuthShell, { AuthFooterLink } from '../components/auth/AuthShell.jsx';
import { authButton, authInput, authLabel } from '../components/auth/authStyles.js';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: location.state?.email || '',
    otp: '',
    newPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.resetPassword(form);
      toast.success('Password reset — please sign in');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Enter the code from your email and your new password."
      footer={<AuthFooterLink text="Back to" linkText="Sign in" to="/login" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={authLabel}>Email</label>
          <input
            type="email"
            required
            placeholder="you@company.com"
            className={authInput}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className={authLabel}>Reset code</label>
          <input
            required
            maxLength={6}
            inputMode="numeric"
            placeholder="000000"
            className={`${authInput} text-center tracking-[0.3em]`}
            value={form.otp}
            onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
          />
        </div>
        <div>
          <label className={authLabel}>New password</label>
          <input
            type="password"
            required
            minLength={6}
            placeholder="At least 6 characters"
            className={authInput}
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          />
        </div>
        <button type="submit" disabled={loading} className={authButton}>
          {loading ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </AuthShell>
  );
}
