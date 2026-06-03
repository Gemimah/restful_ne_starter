import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { signToken } from '../utils/token.js';
import { generateOtp, getOtpExpiry, isOtpExpired } from '../utils/otp.js';
import { sendOtpEmail } from '../utils/email.js';
import { env } from '../config/env.js';

export async function register({ email, password, name }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const otp = generateOtp();
  const otpExpiry = getOtpExpiry(env.otp.expiresMinutes);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      otp,
      otpExpiry,
    },
    select: { id: true, email: true, name: true, role: true, isVerified: true },
  });

  await sendOtpEmail(email, otp);

  return {
    message: 'Registration successful. Please verify your email with the OTP sent.',
    user,
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

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
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
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
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
  const otpExpiry = getOtpExpiry(env.otp.expiresMinutes);

  await prisma.user.update({
    where: { id: user.id },
    data: { otp, otpExpiry },
  });

  await sendOtpEmail(email, otp);

  return { message: 'OTP resent successfully' };
}

export async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, isVerified: true, createdAt: true },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}
