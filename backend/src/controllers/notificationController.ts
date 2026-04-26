import { Response } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { user_id: req.user?.userId },
      orderBy: { created_at: "desc" },
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.update({
      where: { id: Number(id), user_id: req.user?.userId },
      data: { is_read: true },
    });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { user_id: req.user?.userId, is_read: false },
      data: { is_read: true },
    });
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
