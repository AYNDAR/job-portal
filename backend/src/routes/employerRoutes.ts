import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";
import {
  postJob,
  publishJob,
  getApplicantsForJob,
  updateApplicationStatus,
  addNoteToApplication,
  exportApplicantsCSV,
  getEmployerJobs,
} from "../controllers/employer-Controller";

const router = Router();
router.use(verifyToken, requireRole(["Employer"]));

router.post("/jobs", postJob);
router.get("/jobs", getEmployerJobs);
router.patch("/jobs/:jobId/publish", publishJob);
router.get("/jobs/:jobId/applicants", getApplicantsForJob);
router.patch("/applications/:applicationId/status", updateApplicationStatus);
router.post("/applications/:applicationId/notes", addNoteToApplication);
router.get("/jobs/:jobId/export", exportApplicantsCSV);

export default router;
