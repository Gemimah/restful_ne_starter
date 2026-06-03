import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/auth.service.js';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      toast.success('If the email exists, a reset OTP was sent');
      navigate('/reset-password', { state: { email } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-8 shadow-lg">
      <h2 className="mb-6 text-2xl font-bold">Forgot Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" required placeholder="Email" className="w-full rounded-lg border px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-red-600 py-2.5 text-white">{loading ? 'Sending...' : 'Send Reset OTP'}</button>
      </form>
      <p className="mt-4 text-center text-sm"><Link to="/login" className="text-red-600">Back to login</Link></p>
    </div>
  );
}
