import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { signToken, verifyToken } from '../utils/token.js';
import { generateOtp, getOtpExpiry, isOtpExpired } from '../utils/otp.js';
import { sendOtpEmail, sendPasswordResetEmail } from '../utils/email.js';

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  isVerified: true,
  createdAt: true,
};

function formatUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    name: `${user.firstName} ${user.lastName}`,
  };
}

export async function register({ email, password, firstName, lastName }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const otp = generateOtp();
  const otpExpiry = getOtpExpiry(parseInt(process.env.OTP_EXPIRES_MINUTES) || 10);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, firstName, lastName, otp, otpExpiry },
    select: userSelect,
  });

  await sendOtpEmail(email, otp);

  return {
    message: 'Registration successful. Please verify your email with the OTP sent.',
    user: formatUser(user),
  };
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isVerified) {
    throw new AppError('Please verify your email with OTP first', 403);
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  return { token, user: formatUser(user) };
}

export async function logout() {
  return { message: 'Logged out successfully' };
}

export async function verifyOtp({ email, otp }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.isVerified) {
    return { message: 'Email already verified' };
  }

  if (user.otp !== otp || isOtpExpired(user.otpExpiry)) {
    throw new AppError('Invalid or expired OTP', 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, otp: null, otpExpiry: null },
  });

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  return {
    message: 'Email verified successfully',
    token,
    user: formatUser(user),
  };
}

export async function resendOtp({ email }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.isVerified) {
    throw new AppError('Email already verified', 400);
  }

  const otp = generateOtp();
  const otpExpiry = getOtpExpiry(parseInt(process.env.OTP_EXPIRES_MINUTES) || 10);

  await prisma.user.update({ where: { id: user.id }, data: { otp, otpExpiry } });
  await sendOtpEmail(email, otp);

  return { message: 'OTP resent successfully' };
}

export async function getProfile(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: userSelect });
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return formatUser(user);
}

export async function updateProfile(userId, data) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (data.email && data.email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError('Email already in use', 409);
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: data.firstName ?? user.firstName,
      lastName: data.lastName ?? user.lastName,
      email: data.email ?? user.email,
    },
    select: userSelect,
  });

  return formatUser(updated);
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    throw new AppError('Current password is incorrect', 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });

  return { message: 'Password changed successfully' };
}

export async function forgotPassword({ email }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { message: 'If the email exists, a reset OTP has been sent' };
  }

  const otp = generateOtp();
  const resetExpiry = getOtpExpiry(parseInt(process.env.OTP_EXPIRES_MINUTES) || 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: otp, resetExpiry },
  });

  await sendPasswordResetEmail(email, otp);

  return { message: 'If the email exists, a reset OTP has been sent' };
}

export async function resetPassword({ email, otp, newPassword }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid reset request', 400);
  }

  if (user.resetToken !== otp || isOtpExpired(user.resetExpiry)) {
    throw new AppError('Invalid or expired reset OTP', 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, resetToken: null, resetExpiry: null },
  });

  return { message: 'Password reset successfully' };
}

export async function listUsers() {
  const users = await prisma.user.findMany({
    select: userSelect,
    orderBy: { createdAt: 'desc' },
  });
  return users.map(formatUser);
}

export async function updateUserRole(id, role) {
  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: userSelect,
  });
  return formatUser(user);
}

export async function verifyTokenInternal(token) {
  if (!token) {
    throw new AppError('Token is required', 400);
  }

  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: userSelect,
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    return { user: formatUser(user) };
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }
}
