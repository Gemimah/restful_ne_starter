import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import { swaggerSpec } from './docs/swagger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const EXTINGUISHER_URL = process.env.EXTINGUISHER_SERVICE_URL || process.env.RESOURCE_SERVICE_URL || 'http://localhost:5002';
const REPORTING_URL = process.env.REPORTING_SERVICE_URL || 'http://localhost:5003';

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api', limiter);

app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'api-gateway',
    status: 'running',
    timestamp: new Date().toISOString(),
    services: { auth: AUTH_URL, extinguisher: EXTINGUISHER_URL, reporting: REPORTING_URL },
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

const proxyError = (name) => ({
  error: (err, req, res) => {
    console.error(`${name} proxy error:`, err.message);
    res.status(503).json({ success: false, message: `${name} service unavailable` });
  },
});

// Express strips the mount path before proxying — rewrite so services receive full /api/... paths
function proxyTo(target, apiPrefix, name) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path) => `${apiPrefix}${path}`,
    on: proxyError(name),
  });
}

app.use('/api/auth', proxyTo(AUTH_URL, '/api/auth', 'Auth'));
app.use('/api/extinguishers', proxyTo(EXTINGUISHER_URL, '/api/extinguishers', 'Fire Extinguisher'));
app.use('/api/inspections', proxyTo(EXTINGUISHER_URL, '/api/inspections', 'Fire Extinguisher'));
app.use('/api/maintenance', proxyTo(EXTINGUISHER_URL, '/api/maintenance', 'Fire Extinguisher'));
app.use('/api/reports', proxyTo(REPORTING_URL, '/api/reports', 'Reporting'));

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.listen(PORT, () => {
  console.log(`🌐 TZW API Gateway — http://localhost:${PORT}`);
  console.log(`📚 Swagger: http://localhost:${PORT}/api-docs`);
});
