import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import './config/env.js';
import extinguisherRoutes from './routes/extinguisher.routes.js';
import inspectionRoutes from './routes/inspection.routes.js';
import maintenanceRoutes from './routes/maintenance.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

const app = express();
const PORT = process.env.PORT || 5002;

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests from this IP' },
});
app.use(limiter);

app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'fire-extinguisher-service',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/extinguishers', extinguisherRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/maintenance', maintenanceRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  try {
    await connectDatabase();
    const server = app.listen(PORT, () => {
      console.log(`🔥 Fire Extinguisher Service running on http://localhost:${PORT}`);
    });

    const shutdown = async () => {
      server.close();
      await disconnectDatabase();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start Fire Extinguisher Service:', error);
    process.exit(1);
  }
}

start();
