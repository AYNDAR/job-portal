import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";
import { prisma } from "../config/database";

export const requireRole = (allowedTypes: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const userType = await prisma.userType.findUnique({
      where: { id: req.user.userTypeId },
    });

    if (!userType || !allowedTypes.includes(userType.type_name)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
};
