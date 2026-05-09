import { Router } from "express";
import goalController from "./goal.controller.js";

const router = Router();


router.post("/", goalController.createGoal);
router.get("/", goalController.getGoals);
router.post("/:id/contribute", goalController.contributeToGoal);
router.post("/:id/withdraw", goalController.withdrawFromGoal);
router.delete("/:id", goalController.deleteGoal);

export default router;
