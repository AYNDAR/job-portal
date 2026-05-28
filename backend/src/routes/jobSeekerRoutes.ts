import { Router, Response } from "express";
import { verifyToken, AuthRequest } from "../middlewares/authMiddleware";
import prisma from "../lib/prisma";

const router = Router();

// All routes require authentication
router.use(verifyToken);

// GET /api/jobseeker/profile
router.get("/profile", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User ID missing" });
    }
    const profile = await prisma.jobSeekerProfile.findUnique({
      where: { user_id: userId },
    });
    res.json(profile || {});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// PUT /api/jobseeker/profile
router.put("/profile", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User ID missing" });
    }
    const data = req.body;
    const profile = await prisma.jobSeekerProfile.upsert({
      where: { user_id: userId },
      update: data,
      create: { user_id: userId, ...data, full_name: data.fullName || "" },
    });
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// GET /api/jobseeker/bookmarks
router.get("/bookmarks", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User ID missing" });
    }
    const seeker = await prisma.jobSeekerProfile.findUnique({
      where: { user_id: userId },
    });
    if (!seeker) return res.json([]);
    const bookmarks = await prisma.jobBookmark.findMany({
      where: { seeker_id: seeker.id },
      include: { job: true },
    });
    res.json(bookmarks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});

// POST /api/jobseeker/bookmarks/:jobId (toggle)
router.post("/bookmarks/:jobId", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User ID missing" });
    }
    let { jobId } = req.params;
    // Ensure jobId is a string (Express can return array when using regex routes)
    if (Array.isArray(jobId)) jobId = jobId[0];
    if (!jobId) {
      return res.status(400).json({ error: "Invalid job ID" });
    }

    const seeker = await prisma.jobSeekerProfile.findUnique({
      where: { user_id: userId },
    });
    if (!seeker) {
      return res.status(404).json({ error: "Seeker profile not found" });
    }
    const existing = await prisma.jobBookmark.findFirst({
      where: { seeker_id: seeker.id, job_id: jobId },
    });
    if (existing) {
      await prisma.jobBookmark.delete({ where: { id: existing.id } });
      res.json({ bookmarked: false });
    } else {
      await prisma.jobBookmark.create({
        data: { seeker_id: seeker.id, job_id: jobId },
      });
      res.json({ bookmarked: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to toggle bookmark" });
  }
});

// GET /api/jobseeker/applications
router.get("/applications", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User ID missing" });
    }
    const seeker = await prisma.jobSeekerProfile.findUnique({
      where: { user_id: userId },
    });
    if (!seeker) return res.json([]);
    const applications = await prisma.jobApplication.findMany({
      where: { seeker_id: seeker.id },
      include: { job: true, status: true },
    });
    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

export default router;
