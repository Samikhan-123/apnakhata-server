import express, { Request, Response, NextFunction } from 'express';
import * as Sentry from "@sentry/node";
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import dotenv from 'dotenv';

dotenv.config();
// routes imports
import authRoutes from './modules/auth/auth.routes.js';
import ledgerEntryRoutes from './modules/ledger-entry/ledger-entry.routes.js';
import recurringRoutes from './modules/recurring/recurring.routes.js';
import categoryRoutes from './modules/category/category.routes.js';
import budgetRoutes from './modules/budget/budget.routes.js';
import { globalErrorHandler } from './middlewares/error.middleware.js';
import { authenticate, authorizeVerified } from './middlewares/auth.middleware.js';
import { authLimiter } from './middlewares/rate-limit.middleware.js';
import { initRecurringCron } from './modules/recurring/recurring.cron.js';
import adminRoutes from './modules/admin/admin.routes.js';
import logger from './utils/logger.js';
import prisma from './config/prisma.js'; // Trigger DB check

const app = express();

// Trust proxy (Required for Vercel/Render/proxies)
app.set('trust proxy', true);

const dashboardMiddleware = [authenticate, authorizeVerified];

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS - Must be BEFORE helmet and at the top
app.use(cors({
  origin: (origin, callback) => {
    // Diagnostic logging for production
    if (!origin) return callback(null, true);
    
    // Normalize origins (remove trailing slashes for comparison)
    const normalizedOrigin = origin.replace(/\/$/, "");
    const allowedOrigins = [
      (process.env.FRONTEND_URL || '').replace(/\/$/, ""),
      'http://localhost:3000',
      'https://apnakhata-client.vercel.app'
    ].filter(Boolean);

    if (allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      logger.warn(`[CORS-DEBUG] Origin ${origin} blocked. Allowed: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

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
app.use('/api/auth', authRoutes);
app.use('/api/ledger-entries', dashboardMiddleware, ledgerEntryRoutes);
app.use('/api/recurring', dashboardMiddleware, recurringRoutes);
app.use('/api/categories', dashboardMiddleware, categoryRoutes);
app.use('/api/budgets', dashboardMiddleware, budgetRoutes);
app.use('/api/admin', adminRoutes);

// Sentry Error Handler (Must be before your custom error handler)
Sentry.setupExpressErrorHandler(app);

// Error Handler
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

httpServer.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  initRecurringCron();
});

export default app;
