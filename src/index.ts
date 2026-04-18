import express, { Request, Response, NextFunction } from 'express';
import * as Sentry from "@sentry/node";
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Environment Health Check (Production Grade)
const criticalVars = ['DATABASE_URL', 'JWT_SECRET', 'FRONTEND_URL', 'NODE_ENV'];
const missingVars = criticalVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  logger.warn(`⚠️ [ENV-WARN] Missing critical variables: ${missingVars.join(', ')}`);
} else {
  logger.info('✅ [ENV-OK] All critical environment variables are active.');
}

// routes imports
import authRoutes from './modules/auth/auth.routes.js';
import ledgerEntryRoutes from './modules/ledger-entry/ledger-entry.routes.js';
import recurringRoutes from './modules/recurring/recurring.routes.js';
import categoryRoutes from './modules/category/category.routes.js';
import budgetRoutes from './modules/budget/budget.routes.js';
import { globalErrorHandler } from './middlewares/error.middleware.js';
import { authenticate, authorizeVerified } from './middlewares/auth.middleware.js';
import { authLimiter } from './middlewares/rate-limit.middleware.js';
import adminRoutes from './modules/admin/admin.routes.js';
import supportRoutes from './modules/support/support.routes.js';
import { maintenanceGuard } from './middlewares/maintenance.middleware.js';
import { getSystemStatus } from './modules/status/status.controller.js';
import logger from './utils/logger.js';

const app = express();

// Trust proxy (Required for Vercel/Render/proxies)
app.set('trust proxy', true);

const dashboardMiddleware = [authenticate, authorizeVerified, maintenanceGuard];

// --- PRODUCTION-READY FAIL-SAFE CORS ---
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Dynamic Origin Validation
  const isVercel = origin?.endsWith('.vercel.app');
  const isAllowed = !origin || isVercel || origin.includes('localhost') || origin === process.env.FRONTEND_URL;

  if (origin && isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (origin) {
    logger.warn(`🛑 [CORS-BLOCKED] Origin: ${origin}`);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Cookie');
  
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
});

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.get('/api/system/status', getSystemStatus);
app.use('/api/auth', authRoutes);
app.use('/api/ledger-entries', dashboardMiddleware, ledgerEntryRoutes);
app.use('/api/recurring', dashboardMiddleware, recurringRoutes);
app.use('/api/categories', dashboardMiddleware, categoryRoutes);
app.use('/api/budgets', dashboardMiddleware, budgetRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin', adminRoutes);

// Sentry Error Handler (Must be before your custom error handler)
Sentry.setupExpressErrorHandler(app);

// Error Handler
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

httpServer.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});

export default app;
