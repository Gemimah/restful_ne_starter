import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import './config/env.js';
import reportRoutes from './routes/report.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { connectDatabase } from './config/database.js';

const app = express();
const PORT = process.env.PORT || 5003;

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests' },
});
app.use(limiter);

app.get('/health', (req, res) => {
  res.json({ success: true, service: 'reporting-service', status: 'running', timestamp: new Date().toISOString() });
});

app.use('/api/reports', reportRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`📊 Reporting Service running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Reporting Service:', error);
    process.exit(1);
  }
}

start();
