import { Router, Response } from "express";
import { verifyToken, AuthRequest } from "../middlewares/authMiddleware";
import multer from "multer";
import path from "path";
import fs from "fs";
import prisma from "../lib/prisma";

const router = Router();
router.use(verifyToken);

// ─── Multer setup ─────────────────────────────────────────────
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const imageUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_r, f, cb) =>
    f.mimetype.startsWith("image/")
      ? cb(null, true)
      : cb(new Error("Images only")),
});

const resumeUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_r, f, cb) => {
    const ok = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ].includes(f.mimetype);
    ok ? cb(null, true) : cb(new Error("PDF or Word only"));
  },
});

const publicUrl = (req: AuthRequest, filename: string) =>
  `${req.protocol}://${req.get("host")}/uploads/${filename}`;

// ─── GET /api/jobseeker/profile ───────────────────────────────
// Only uses fields that exist in the database; missing fields get empty defaults.
router.get("/profile", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "User ID missing" });
    const profile = await prisma.jobSeekerProfile.findUnique({
      where: { user_id: userId },
    });
    if (!profile) return res.json({});
    // Return all stored fields in camelCase
    console.log("Profile from DB:", profile);
    res.json({
      fullName: profile.full_name || "",
      phone: profile.phone || "",
      resumeUrl: profile.resume_url || "",
      avatarUrl: profile.avatar_url || "",
      skills: profile.skills || [],
      location: profile.location || "",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// ─── PUT /api/jobseeker/profile ───────────────────────────────
// Only updates columns that actually exist.
router.put("/profile", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "User ID missing" });

    const b = req.body;
    const data: Record<string, unknown> = {};

    if (b.fullName !== undefined) data.full_name = b.fullName;
    if (b.phone !== undefined) data.phone = b.phone;
    if (b.resumeUrl !== undefined) data.resume_url = b.resumeUrl;
    if (b.avatarUrl !== undefined) data.avatar_url = b.avatarUrl;
    if (b.skills !== undefined) data.skills = b.skills;
    if (b.location !== undefined) data.location = b.location;
    // Accept snake_case as well
    if (b.resume_url !== undefined) data.resume_url = b.resume_url;
    if (b.avatar_url !== undefined) data.avatar_url = b.avatar_url;

    // If no data to update, return early (but don't fail)
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const profile = await prisma.jobSeekerProfile.upsert({
      where: { user_id: userId },
      update: data,
      create: {
        user_id: userId,
        full_name: b.fullName || "",
        ...data,
      },
    });

    res.json({ success: true, profile });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// ─── POST /api/jobseeker/avatar ───────────────────────────────
router.post(
  "/avatar",
  imageUpload.single("avatar"),
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      const url = publicUrl(req, req.file.filename);

      await prisma.jobSeekerProfile.upsert({
        where: { user_id: userId },
        update: { avatar_url: url },
        create: { user_id: userId, full_name: "", avatar_url: url },
      });

      res.json({ url, avatarUrl: url });
    } catch (error) {
      console.error("Avatar upload error:", error);
      res.status(500).json({ error: "Avatar upload failed" });
    }
  },
);

// ─── POST /api/jobseeker/resume ───────────────────────────────
router.post(
  "/resume",
  resumeUpload.single("resume"),
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      const url = publicUrl(req, req.file.filename);

      await prisma.jobSeekerProfile.upsert({
        where: { user_id: userId },
        update: { resume_url: url },
        create: { user_id: userId, full_name: "", resume_url: url },
      });

      res.json({ url, resumeUrl: url });
    } catch (error) {
      console.error("Resume upload error:", error);
      res.status(500).json({ error: "Resume upload failed" });
    }
  },
);

// ─── GET /api/jobseeker/bookmarks ─────────────────────────────
router.get("/bookmarks", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "User ID missing" });

    const seeker = await prisma.jobSeekerProfile.findUnique({
      where: { user_id: userId },
    });
    if (!seeker) return res.json([]);

    const bookmarks = await prisma.jobBookmark.findMany({
      where: { seeker_id: seeker.id },
      include: {
        job: {
          include: {
            employer: { select: { company_name: true, location: true } },
            industry: true,
            employment_type: true,
          },
        },
      },
    });

    // Return shape expected by frontend Bookmark interface
    res.json(
      bookmarks.map((bm) => ({
        jobId: bm.job_id,
        job: bm.job
          ? {
              id: bm.job.id,
              title: bm.job.title,
              company: bm.job.employer?.company_name || "",
              location: bm.job.employer?.location || "",
              salaryRange: bm.job.salary_range || "",
              employmentType: bm.job.employment_type?.type_name || "",
              industry: bm.job.industry?.industry_name || "",
              description: bm.job.description || "",
            }
          : null,
      })),
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});

// ─── POST /api/jobseeker/bookmarks/:jobId (toggle) ───────────
router.post("/bookmarks/:jobId", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "User ID missing" });

    let { jobId } = req.params;
    // Ensure jobId is a string (not an array)
    if (Array.isArray(jobId)) jobId = jobId[0];
    if (!jobId) return res.status(400).json({ error: "Invalid job ID" });

    const seeker = await prisma.jobSeekerProfile.findUnique({
      where: { user_id: userId },
    });
    if (!seeker)
      return res.status(404).json({ error: "Seeker profile not found" });

    const existing = await prisma.jobBookmark.findFirst({
      where: { seeker_id: seeker.id, job_id: jobId as string }, // cast to string
    });

    if (existing) {
      await prisma.jobBookmark.delete({ where: { id: existing.id } });
      res.json({ bookmarked: false });
    } else {
      await prisma.jobBookmark.create({
        data: { seeker_id: seeker.id, job_id: jobId as string },
      });
      res.json({ bookmarked: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to toggle bookmark" });
  }
});

// ─── GET /api/jobseeker/applications ─────────────────────────
router.get("/applications", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "User ID missing" });

    const seeker = await prisma.jobSeekerProfile.findUnique({
      where: { user_id: userId },
    });
    if (!seeker) return res.json([]);

    const applications = await prisma.jobApplication.findMany({
      where: { seeker_id: seeker.id },
      include: { job: true, status: true },
      orderBy: { applied_at: "desc" },
    });

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

export default router;
