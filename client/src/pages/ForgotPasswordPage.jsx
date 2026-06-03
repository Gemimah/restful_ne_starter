import { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/auth.service.js';
import AuthShell, { AuthFooterLink } from '../components/auth/AuthShell.jsx';
import IconInput from '../components/ui/IconInput.jsx';
import { authButton, authLabel } from '../components/auth/authStyles.js';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      toast.success('If the email exists, a reset code was sent');
      navigate('/reset-password', { state: { email } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We will email you a one-time code to choose a new password."
      footer={<AuthFooterLink text="Remembered it?" linkText="Sign in" to="/login" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={authLabel}>Email</label>
          <IconInput
            icon={Mail}
            type="email"
            required
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading} className={`${authButton} inline-flex items-center justify-center gap-2`}>
          <Send className="h-4 w-4" aria-hidden />
          {loading ? 'Sending...' : 'Send reset code'}
        </button>
      </form>
    </AuthShell>
  );
}
