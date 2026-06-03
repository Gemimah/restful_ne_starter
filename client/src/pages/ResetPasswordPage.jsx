import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/auth.service.js';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: location.state?.email || '', otp: '', newPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.resetPassword(form);
      toast.success('Password reset — please login');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-8 shadow-lg">
      <h2 className="mb-6 text-2xl font-bold">Reset Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" required placeholder="Email" className="w-full rounded-lg border px-3 py-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input required maxLength={6} placeholder="OTP" className="w-full rounded-lg border px-3 py-2" value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value })} />
        <input type="password" required minLength={6} placeholder="New Password" className="w-full rounded-lg border px-3 py-2" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-red-600 py-2.5 text-white">{loading ? 'Resetting...' : 'Reset Password'}</button>
      </form>
      <p className="mt-4 text-center text-sm"><Link to="/login" className="text-red-600">Back to login</Link></p>
    </div>
  );
}
