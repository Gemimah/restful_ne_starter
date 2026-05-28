import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/auth.service.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.verifyOtp({ email, otp });
      if (data.token) {
        login(data.token, data.user);
      }
      toast.success('Email verified!');
      navigate('/');
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authService.resendOtp({ email });
      toast.success('OTP resent — check console in dev mode');
    } catch {
      // handled
    }
  };

  return (
    <div className="rounded-2xl bg-white p-8 shadow-lg">
      <h2 className="mb-6 text-2xl font-bold text-slate-900">Verify email</h2>
      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">OTP Code</label>
          <input
            type="text"
            required
            maxLength={6}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-center text-lg tracking-widest"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="000000"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>
      <button
        type="button"
        onClick={handleResend}
        className="mt-4 w-full text-sm text-indigo-600 hover:text-indigo-700"
      >
        Resend OTP
      </button>
    </div>
  );
}
