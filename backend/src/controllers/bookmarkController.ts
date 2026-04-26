import { Response } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../middlewares/authMiddleware";

export const addBookmark = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.body;
    const seekerProfile = await prisma.jobSeekerProfile.findUnique({
      where: { user_id: req.user?.userId },
    });
    if (!seekerProfile)
      return res.status(404).json({ error: "Profile not found" });

    const bookmark = await prisma.jobBookmark.create({
      data: {
        seeker_id: seekerProfile.id,
        job_id: jobId,
      },
    });
    res.status(201).json(bookmark);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Already bookmarked" });
    }
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const removeBookmark = async (req: AuthRequest, res: Response) => {
  try {
    const jobId = req.params.jobId as string; // <-- cast to string
    const seekerProfile = await prisma.jobSeekerProfile.findUnique({
      where: { user_id: req.user?.userId },
    });
    if (!seekerProfile)
      return res.status(404).json({ error: "Profile not found" });

    await prisma.jobBookmark.deleteMany({
      where: {
        seeker_id: seekerProfile.id,
        job_id: jobId,
      },
    });
    res.json({ message: "Bookmark removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getBookmarks = async (req: AuthRequest, res: Response) => {
  try {
    const seekerProfile = await prisma.jobSeekerProfile.findUnique({
      where: { user_id: req.user?.userId },
    });
    if (!seekerProfile)
      return res.status(404).json({ error: "Profile not found" });

    const bookmarks = await prisma.jobBookmark.findMany({
      where: { seeker_id: seekerProfile.id },
      include: {
        job: {
          include: {
            employer: { select: { company_name: true, logo_url: true } },
            industry: true,
            employment_type: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
    res.json(bookmarks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
