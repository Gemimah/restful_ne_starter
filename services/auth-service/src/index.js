import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import './config/env.js';
import authRoutes from './routes/auth.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests from this IP' },
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    service: 'auth-service',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function start() {
  try {
    await connectDatabase();
    
    const server = app.listen(PORT, () => {
      console.log(`🔐 Auth Service running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });

    const shutdown = async () => {
      console.log('\nShutting down Auth Service...');
      server.close();
      await disconnectDatabase();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start Auth Service:', error);
    process.exit(1);
  }
}

start();
