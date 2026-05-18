import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";
import {
  postJob,
  publishJob,
  getEmployerJobs,
  getApplicantsForJob,
  updateApplicationStatus,
  addNoteToApplication,
  exportApplicantsCSV,
  getEmployerStats,
  getRecentApplicants,
  getEmployerJobPostStats,
  getEmployerApplicationStats,
  updateEmployerProfile,
  getEmployerProfile,
} from "../controllers/employer-Controller";

const router = Router();

// All employer routes require authentication and Employer role
router.use(verifyToken, requireRole(["Employer"]));

// Job management
router.post("/jobs", postJob);
router.get("/jobs", getEmployerJobs);
router.patch("/jobs/:jobId/publish", publishJob);
router.get("/jobs/:jobId/applicants", getApplicantsForJob);
router.get("/recent-applicants", getRecentApplicants);
router.get("/jobs/:jobId/export", exportApplicantsCSV);

// Application management
router.patch("/applications/:applicationId/status", updateApplicationStatus);
router.post("/applications/:applicationId/notes", addNoteToApplication);

// Statistics
router.get("/stats", getEmployerStats);
router.get("/profile", getEmployerProfile);
router.put("/profile", updateEmployerProfile);
router.get("/stats/applications", getEmployerApplicationStats);
router.get("/stats/job-posts", getEmployerJobPostStats);
router.get("/jobs", getEmployerJobs);

export default router;
