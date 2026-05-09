import { Goal, Prisma } from "@prisma/client";
import prisma from "../../config/prisma.js";

class GoalRepository {
  async create(data: Prisma.GoalUncheckedCreateInput): Promise<Goal> {
    return prisma.goal.create({ data });
  }

  async findByUserId(userId: string): Promise<Goal[]> {
    return prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string, userId: string): Promise<Goal | null> {
    return prisma.goal.findUnique({
      where: { id, userId },
    });
  }

  async update(id: string, userId: string, data: Prisma.GoalUpdateInput): Promise<Goal> {
    return prisma.goal.update({
      where: { id, userId },
      data,
    });
  }

  async delete(id: string, userId: string): Promise<Goal> {
    return prisma.goal.delete({
      where: { id, userId },
    });
  }

  // Atomically increment savedAmount
  async incrementSavedAmount(id: string, userId: string, amount: number): Promise<Goal> {
    return prisma.goal.update({
      where: { id, userId },
      data: {
        savedAmount: { increment: amount },
      },
    });
  }

  // Atomically decrement savedAmount
  async decrementSavedAmount(id: string, userId: string, amount: number): Promise<Goal> {
    return prisma.goal.update({
      where: { id, userId },
      data: {
        savedAmount: { decrement: amount },
      },
    });
  }
}

export default new GoalRepository();
