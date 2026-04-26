import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import {
  applyToJob,
  getMyApplications,
} from "../controllers/applicationController";

const router = Router();
router.use(verifyToken);

router.post("/", applyToJob);
router.get("/my-applications", getMyApplications);

export default router;
