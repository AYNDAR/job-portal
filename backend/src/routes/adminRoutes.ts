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
} from "../controllers/admin-Controller";

const router = Router();
router.use(verifyToken, requireRole(["Admin", "Super Admin"]));
// Super Admin only routes (user_type_id = 4)

router.get("/users", getAllUsers);
router.patch("/users/:userId/suspend", suspendUser);
router.get("/jobs", getAllJobs);
router.patch("/jobs/:jobId/close", closeJob);
router.get("/stats", getAdminStats); // <-- add this

router.get("/admins", requireRole(["Super Admin"]), getAdminUsers);
router.post("/admins", requireRole(["Super Admin"]), createAdminUser);
router.put("/admins/:id", requireRole(["Super Admin"]), updateAdminUser);
router.delete("/admins/:id", requireRole(["Super Admin"]), deleteAdminUser);

export default router;
