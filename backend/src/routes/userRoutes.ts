import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import {
  uploadResumeMiddleware,
  uploadResume,
} from "../controllers/fileController";

const router = Router();

router.post(
  "/upload/resume",
  verifyToken,
  uploadResumeMiddleware,
  uploadResume,
);

export default router;
