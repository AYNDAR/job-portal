import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";
import {
  getAllUsers,
  suspendUser,
  getAllJobs,
  closeJob,
  getAdminStats,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  getAllApplications,
  changeAdminPassword,
  updateAdminProfile,
  getAdminProfile,
  getTopCategories,
  getApplicationStats,
  getJobPostStats,
  getRegistrationStats,
  getUserGrowth,
  getIndustryDistribution,
  getJobPostingsStats,
  getTrends,
  // New functions for user/employer profiles
  getUserProfile,
  getEmployerProfileById,
} from "../controllers/admin-Controller";

const router = Router();
router.use(verifyToken, requireRole(["Admin", "Super Admin"]));

// ==================== User Management ====================
router.get("/users", getAllUsers);
router.patch("/users/:userId/suspend", suspendUser);
router.get("/users/:userId/profile", getUserProfile); // ✅ added
router.get("/users/:userId/employer-profile", getEmployerProfileById); // ✅ added

// ==================== Job Management ====================
router.get("/jobs", getAllJobs);
router.patch("/jobs/:jobId/close", closeJob);

// ==================== Statistics ====================
router.get("/stats", getAdminStats);
router.get("/stats/registrations", getRegistrationStats);
router.get("/stats/job-posts", getJobPostStats);
router.get("/stats/applications", getApplicationStats);
router.get("/stats/top-categories", getTopCategories);
router.get("/stats/trends", getTrends);
router.get("/stats/job-postings", getJobPostingsStats);
router.get("/stats/industry-distribution", getIndustryDistribution);
router.get("/stats/user-growth", getUserGrowth);

// ==================== Admin Accounts (Super Admin only) ====================
router.get("/admins", requireRole(["Super Admin"]), getAdminUsers);
router.post("/admins", requireRole(["Super Admin"]), createAdminUser);
router.put("/admins/:id", requireRole(["Super Admin"]), updateAdminUser);
router.delete("/admins/:id", requireRole(["Super Admin"]), deleteAdminUser);

// ==================== Applications ====================
router.get("/applications", getAllApplications);

// ==================== Admin Profile ====================
router.get("/profile", getAdminProfile);
router.put("/profile", updateAdminProfile);
router.post("/change-password", changeAdminPassword);

export default router;
