import axios from 'axios';
import { AppError } from '../utils/AppError.js';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
    const response = await axios.post(`${authServiceUrl}/api/auth/verify-token`, { token });

    if (!response.data.success) {
      throw new AppError('Invalid token', 401);
    }

    req.user = response.data.user;
    next();
  } catch (error) {
    if (error.response?.status === 401) {
      return next(new AppError('Invalid or expired token', 401));
    }
    if (error.code === 'ECONNREFUSED') {
      return next(new AppError('Auth service unavailable', 503));
    }
    next(error);
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return next(new AppError('Forbidden', 403));
    }
    next();
  };
}
