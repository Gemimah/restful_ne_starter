import { AppError } from '../utils/AppError.js';

export function notFoundHandler(req, res, next) {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
}

export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    service: 'reporting-service',
  });
}
