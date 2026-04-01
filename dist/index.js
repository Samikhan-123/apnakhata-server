import express from 'express';
import * as Sentry from "@sentry/node";
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import dotenv from 'dotenv';
dotenv.config();
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
const app = express();
const dashboardMiddleware = [authenticate, authorizeVerified];
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(helmet());
app.use(cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3000'],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Routes
app.use('/api/auth', authLimiter, authRoutes);
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
    console.log(`🚀 Server running on port ${PORT}`);
    initRecurringCron();
});
export default app;
//# sourceMappingURL=index.js.map