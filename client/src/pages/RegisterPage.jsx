import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/auth.service.js';
import { validateRegisterForm } from '../utils/validation.js';

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

function inputClass(hasError) {
  const base =
    'w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1';
  return hasError
    ? `${base} border-red-500 focus:border-red-500 focus:ring-red-500`
    : `${base} border-slate-300 focus:border-red-500 focus:ring-red-500`;
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
        if (field === 'password' && next.confirmPassword) {
          delete next.confirmPassword;
        }
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
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-8 shadow-lg">
      <h2 className="mb-2 text-2xl font-bold text-slate-900">TZW LTD</h2>
      <p className="mb-6 text-sm text-slate-500">Fire Extinguisher Management — Create account</p>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">First Name</label>
            <input
              type="text"
              autoComplete="given-name"
              maxLength={50}
              className={inputClass(errors.firstName)}
              value={form.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              aria-invalid={Boolean(errors.firstName)}
            />
            <FieldError message={errors.firstName} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Last Name</label>
            <input
              type="text"
              autoComplete="family-name"
              maxLength={50}
              className={inputClass(errors.lastName)}
              value={form.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              aria-invalid={Boolean(errors.lastName)}
            />
            <FieldError message={errors.lastName} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            autoComplete="email"
            className={inputClass(errors.email)}
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            aria-invalid={Boolean(errors.email)}
          />
          <FieldError message={errors.email} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            autoComplete="new-password"
            maxLength={128}
            className={inputClass(errors.password)}
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            aria-invalid={Boolean(errors.password)}
          />
          <FieldError message={errors.password} />
          <p className="mt-1 text-xs text-slate-500">At least 6 characters</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Confirm Password</label>
          <input
            type="password"
            autoComplete="new-password"
            maxLength={128}
            className={inputClass(errors.confirmPassword)}
            value={form.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
            aria-invalid={Boolean(errors.confirmPassword)}
          />
          <FieldError message={errors.confirmPassword} />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-red-600 py-2.5 font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-red-600 hover:text-red-700">Sign in</Link>
      </p>
    </div>
  );
}
