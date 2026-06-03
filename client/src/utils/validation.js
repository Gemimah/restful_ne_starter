const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[\p{L}\s'-]+$/u;

export function validateEmail(value) {
  const email = (value ?? '').trim();
  if (!email) return 'Email is required';
  if (!EMAIL_REGEX.test(email)) return 'Enter a valid email address';
  return '';
}

export function validateName(value, label) {
  const name = (value ?? '').trim();
  if (!name) return `${label} is required`;
  if (name.length < 2) return `${label} must be at least 2 characters`;
  if (name.length > 50) return `${label} must be at most 50 characters`;
  if (!NAME_REGEX.test(name)) return `${label} may only contain letters, spaces, hyphens, and apostrophes`;
  return '';
}

export function validatePassword(value) {
  const password = value ?? '';
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (password.length > 128) return 'Password must be at most 128 characters';
  return '';
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return '';
}

/** Expiry must be strictly after installation (same day is invalid). */
export function validateExtinguisherDates(installationDate, expiryDate) {
  if (!installationDate) return { installationDate: 'Installation date is required' };
  if (!expiryDate) return { expiryDate: 'Expiry date is required' };

  const install = new Date(installationDate);
  const expiry = new Date(expiryDate);
  if (Number.isNaN(install.getTime())) {
    return { installationDate: 'Enter a valid installation date' };
  }
  if (Number.isNaN(expiry.getTime())) {
    return { expiryDate: 'Enter a valid expiry date' };
  }

  install.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  if (expiry <= install) {
    return {
      expiryDate: 'Expiry date must be after installation date (when the unit was put in service)',
    };
  }
  return {};
}

export function validateRegisterForm(form) {
  const errors = {};
  const firstName = validateName(form.firstName, 'First name');
  const lastName = validateName(form.lastName, 'Last name');
  const email = validateEmail(form.email);
  const password = validatePassword(form.password);
  const confirmPassword = validateConfirmPassword(form.password, form.confirmPassword);

  if (firstName) errors.firstName = firstName;
  if (lastName) errors.lastName = lastName;
  if (email) errors.email = email;
  if (password) errors.password = password;
  if (confirmPassword) errors.confirmPassword = confirmPassword;

  return errors;
}

export function validateLoginForm(form) {
  const errors = {};
  const email = validateEmail(form.email);
  const password = validatePassword(form.password);

  if (email) errors.email = email;
  if (password) errors.password = password;

  return errors;
}
