import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/auth.service.js';
import { useAuth } from '../context/AuthContext.jsx';
import AuthShell, { AuthFooterLink } from '../components/auth/AuthShell.jsx';
import { authButton, authInput, authLabel } from '../components/auth/authStyles.js';

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
      toast.success('OTP resent — check your email');
    } catch {
      // handled
    }
  };

  return (
    <AuthShell
      title="Verify your email"
      subtitle="Enter the 6-digit code we sent to your inbox to activate your account."
      footer={<AuthFooterLink text="Wrong email?" linkText="Back to register" to="/register" />}
    >
      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className={authLabel}>Email</label>
          <input
            type="email"
            required
            placeholder="you@company.com"
            className={authInput}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className={authLabel}>One-time code</label>
          <input
            type="text"
            required
            maxLength={6}
            inputMode="numeric"
            placeholder="000000"
            className={`${authInput} text-center text-lg tracking-[0.3em]`}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
        </div>
        <button type="submit" disabled={loading} className={authButton}>
          {loading ? 'Verifying...' : 'Verify email'}
        </button>
      </form>
      <button
        type="button"
        onClick={handleResend}
        className="mt-4 w-full text-sm font-medium text-sky-700 hover:text-sky-800"
      >
        Resend code
      </button>
    </AuthShell>
  );
}
