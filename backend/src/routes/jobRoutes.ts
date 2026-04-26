import { Router } from "express";
import { searchJobs, getJobById } from "../controllers/jobController";

const router = Router();

router.get("/search", searchJobs);
router.get("/:id", getJobById);

export default router;
