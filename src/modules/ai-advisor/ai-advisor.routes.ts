import { Router } from "express";
import aiAdvisorController from "./ai-advisor.controller.js";
import { authenticate, authorizeVerified } from "../../middlewares/auth.middleware.js";
import { aiLimiter } from "../../middlewares/rate-limit.middleware.js";

const router = Router();

/**
 * @route   GET /api/ai-advisor/insights
 * @desc    Get AI-generated financial insights
 * @access  Private
 */
router.get("/insights", authenticate, authorizeVerified, aiLimiter, aiAdvisorController.getInsights);

export default router;
