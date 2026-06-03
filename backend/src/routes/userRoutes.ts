import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import { uploadAvatar } from "../controllers/uploadController";
import { upload } from "../middlewares/upload";
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
router.post(
  "/upload/avatar",
  verifyToken,
  upload.single("avatar"),
  uploadAvatar,
);

export default router;
