import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController";

const router = Router();
router.use(verifyToken);

router.get("/", getNotifications);
router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);

export default router;
