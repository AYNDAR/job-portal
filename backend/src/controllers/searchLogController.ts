import { Request, Response } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getSearchLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const logs = await prisma.searchLog.findMany({
      where: req.user?.userTypeId === 3 ? {} : { user_id: req.user?.userId }, // Admin sees all
      orderBy: { created_at: "desc" },
      take: Number(limit),
      skip,
    });

    const total = await prisma.searchLog.count();
    res.json({
      data: logs,
      pagination: { page: Number(page), limit: Number(limit), total },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteOldLogs = async (req: Request, res: Response) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    await prisma.searchLog.deleteMany({
      where: { created_at: { lt: thirtyDaysAgo } },
    });
    res.json({ message: "Old search logs deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
