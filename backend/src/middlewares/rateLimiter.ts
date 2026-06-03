import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { Request } from "express";
import { AuthRequest } from "./authMiddleware";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many login attempts, please try again later" },
});

export const jobPostLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req: Request) => {
    const authReq = req as AuthRequest;
    if (authReq.user?.userId) return authReq.user.userId;
    return ipKeyGenerator(req.ip ?? "unknown");
  },
  message: { error: "Too many job posts, please try again later" },
});
