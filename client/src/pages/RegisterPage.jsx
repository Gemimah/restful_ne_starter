import { useState } from 'react';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/auth.service.js';
import { validateRegisterForm } from '../utils/validation.js';
import AuthShell, { AuthFooterLink } from '../components/auth/AuthShell.jsx';
import IconInput from '../components/ui/IconInput.jsx';
import { authButton, authInputError, authLabel } from '../components/auth/authStyles.js';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

function fieldClass(hasError) {
  return hasError ? authInputError : '';
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        if (field === 'password' && next.confirmPassword) delete next.confirmPassword;
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegisterForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };
      await authService.register(payload);
      toast.success('Check your email for OTP');
      navigate('/verify-otp', { state: { email: payload.email } });
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Register to access the TZW fire safety platform. You will verify your email with a one-time code."
      footer={<AuthFooterLink text="Already have an account?" linkText="Sign in" to="/login" />}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={authLabel}>First name</label>
            <IconInput
              icon={User}
              type="text"
              autoComplete="given-name"
              maxLength={50}
              placeholder="Jane"
              inputClassName={fieldClass(errors.firstName)}
              value={form.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
            />
            <FieldError message={errors.firstName} />
          </div>
          <div>
            <label className={authLabel}>Last name</label>
            <IconInput
              icon={User}
              type="text"
              autoComplete="family-name"
              maxLength={50}
              placeholder="Doe"
              inputClassName={fieldClass(errors.lastName)}
              value={form.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
            />
            <FieldError message={errors.lastName} />
          </div>
        </div>
        <div>
          <label className={authLabel}>Email</label>
          <IconInput
            icon={Mail}
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            inputClassName={fieldClass(errors.email)}
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
          />
          <FieldError message={errors.email} />
        </div>
        <div>
          <label className={authLabel}>Password</label>
          <IconInput
            icon={Lock}
            type="password"
            autoComplete="new-password"
            maxLength={128}
            placeholder="At least 6 characters"
            inputClassName={fieldClass(errors.password)}
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
          />
          <FieldError message={errors.password} />
        </div>
        <div>
          <label className={authLabel}>Confirm password</label>
          <IconInput
            icon={Lock}
            type="password"
            autoComplete="new-password"
            maxLength={128}
            placeholder="Repeat password"
            inputClassName={fieldClass(errors.confirmPassword)}
            value={form.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
          />
          <FieldError message={errors.confirmPassword} />
        </div>
        <button type="submit" disabled={loading} className={`${authButton} inline-flex items-center justify-center gap-2`}>
          <UserPlus className="h-4 w-4" aria-hidden />
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}
