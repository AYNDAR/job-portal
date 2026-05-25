import { Router, RequestHandler } from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";
import { upload } from "../middlewares/upload"; // multer config (memory storage)

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
  uploadCompanyLogo, // ✅ now accepts Request (no custom interface)
  uploadJobAttachments, // ✅ now accepts Request
} from "../controllers/employerController";

const router = Router();

// All employer routes require authentication and Employer role
router.use(verifyToken, requireRole(["Employer"]));

// ==================== Job Management ====================
router.post("/jobs", postJob);
router.get("/jobs", getEmployerJobs);
router.patch("/jobs/:jobId/publish", publishJob);
router.get("/jobs/:jobId/applicants", getApplicantsForJob);
router.get("/recent-applicants", getRecentApplicants);
router.get("/jobs/:jobId/export", exportApplicantsCSV);

// Upload multiple attachments for a specific job
router.post(
  "/jobs/:jobId/attachments",
  upload.array("attachments", 5), // max 5 files
  uploadJobAttachments as RequestHandler,
);

// ==================== Application Management ====================
router.patch("/applications/:applicationId/status", updateApplicationStatus);
router.post("/applications/:applicationId/notes", addNoteToApplication);

// ==================== Statistics ====================
router.get("/stats", getEmployerStats);
router.get("/stats/applications", getEmployerApplicationStats);
router.get("/stats/job-posts", getEmployerJobPostStats);

// ==================== Profile Management ====================
router.get("/profile", getEmployerProfile);
router.put("/profile", updateEmployerProfile);

// Upload company logo (single file)
router.post("/profile/logo", upload.single("logo"), uploadCompanyLogo as RequestHandler);

export default router;
