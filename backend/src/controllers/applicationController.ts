import { Request, Response } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../middlewares/authMiddleware";

export const applyToJob = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId, coverLetter } = req.body;
    const seekerId = req.user?.userId;

    if (!seekerId) return res.status(401).json({ error: "Unauthorized" });

    // Check if already applied
    const existing = await prisma.jobApplication.findFirst({
      where: {
        job_id: jobId,
        seeker: { user_id: seekerId },
      },
    });
    if (existing) {
      return res
        .status(400)
        .json({ error: "You have already applied to this job" });
    }

    // Get seeker profile
    const seekerProfile = await prisma.jobSeekerProfile.findUnique({
      where: { user_id: seekerId },
    });
    if (!seekerProfile || !seekerProfile.resume_url) {
      return res
        .status(400)
        .json({ error: "Please upload a resume before applying" });
    }

    const pendingStatus = await prisma.jobApplicationStatus.findFirst({
      where: { status_name: "Pending" },
    });

    const application = await prisma.jobApplication.create({
      data: {
        job_id: jobId,
        seeker_id: seekerProfile.id,
        cover_letter: coverLetter,
        resume_url: seekerProfile.resume_url,
        status_id: pendingStatus!.id,
      },
    });

    // Trigger notification to employer
    const job = await prisma.jobPost.findUnique({
      where: { id: jobId },
      include: { employer: { include: { user: true } } },
    });
    if (job?.employer.user.id) {
      await prisma.notification.create({
        data: {
          user_id: job.employer.user.id,
          message: `New application for ${job.title} from ${seekerProfile.full_name}`,
          trigger_type: "Application",
        },
      });
      // TODO: send email via emailService
    }

    res.status(201).json({ message: "Application submitted", application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getMyApplications = async (req: AuthRequest, res: Response) => {
  try {
    const seekerProfile = await prisma.jobSeekerProfile.findUnique({
      where: { user_id: req.user?.userId },
    });
    if (!seekerProfile)
      return res.status(404).json({ error: "Profile not found" });

    const applications = await prisma.jobApplication.findMany({
      where: { seeker_id: seekerProfile.id },
      include: {
        job: {
          include: {
            employer: { select: { company_name: true } },
            industry: true,
            employment_type: true,
          },
        },
        status: true,
      },
      orderBy: { applied_at: "desc" },
    });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
