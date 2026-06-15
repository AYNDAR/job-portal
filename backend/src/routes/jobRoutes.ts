import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";
import { upload } from "../middlewares/upload"; // for logo upload

import {
  searchJobs,
  getJobById,
  createJob, // new controller
  updateJob, // optional
  deleteJob, // optional
  getJobs, // list with filters
} from "../controllers/jobController";
import prisma from "../lib/prisma";

const router = Router();

// Public routes (no authentication)
router.get("/", getJobs); // GET /api/jobs?keyword=&location=&industry=
router.get("/search", searchJobs); // alternative search endpoint
router.get("/:id", getJobById);

// Protected routes (employer only)
router.post(
  "/",
  verifyToken,
  requireRole(["Employer"]),
  upload.single("logo"),
  createJob,
);
router.put("/:id", verifyToken, requireRole(["Employer"]), updateJob);
router.delete("/:id", verifyToken, requireRole(["Employer"]), deleteJob);
// Public - no auth required
router.get("/industries", async (req, res) => {
  try {
    const industries = await prisma.jobIndustry.findMany();
    res.json(industries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch industries" });
  }
});

export default router;
