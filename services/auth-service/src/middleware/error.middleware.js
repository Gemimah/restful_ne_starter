import { AppError } from '../utils/AppError.js';

export function notFoundHandler(req, res, next) {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
}

export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'A record with this value already exists';
  }

  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    service: 'auth-service',
    ...(process.env.NODE_ENV === 'development' && !err.isOperational && { stack: err.stack }),
  });
}
