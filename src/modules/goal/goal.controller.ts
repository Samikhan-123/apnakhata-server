import { Request, Response, NextFunction } from "express";
import goalService from "./goal.service.js";

class GoalController {
  async createGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const goal = await goalService.createGoal(userId, req.body);
      res.status(201).json({ success: true, data: goal });
    } catch (error) {
      next(error);
    }
  }

  async getGoals(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const goals = await goalService.getGoals(userId);
      res.status(200).json({ success: true, data: goals });
    } catch (error) {
      next(error);
    }
  }

  async contributeToGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const id = req.params.id as string;
      const { amount, description } = req.body;

      const goal = await goalService.contributeToGoal(userId, id, Number(amount), description);
      res.status(200).json({ success: true, data: goal });
    } catch (error) {
      next(error);
    }
  }

  async withdrawFromGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const id = req.params.id as string;
      const { amount, description } = req.body;

      const goal = await goalService.withdrawFromGoal(userId, id, Number(amount), description);
      res.status(200).json({ success: true, data: goal });
    } catch (error) {
      next(error);
    }
  }

  async deleteGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const id = req.params.id as string;
      const { returnFunds } = req.body;

      await goalService.deleteGoal(userId, id, returnFunds);
      res.status(200).json({ success: true, message: "Goal deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

export default new GoalController();
