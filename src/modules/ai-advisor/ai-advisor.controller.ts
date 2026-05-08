import { Request, Response, NextFunction } from "express";
import aiAdvisorService from "./ai-advisor.service.js";

class AIAdvisorController {
  async getInsights(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { query, currency } = req.query;
      
      const insights = await aiAdvisorService.getFinancialInsights(
        userId, 
        query as string,
        currency as string
      );

      res.status(200).json({
        success: true,
        data: insights,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AIAdvisorController();
