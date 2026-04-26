import { Response } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../middlewares/authMiddleware";

export const postJob = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      industry_id,
      employment_type_id,
      salary_range,
    } = req.body;
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { user_id: req.user?.userId },
    });
    if (!employerProfile) {
      return res.status(403).json({ error: "Employer profile not found" });
    }

    const draftStatus = await prisma.jobPostStatus.findFirst({
      where: { status_name: "Draft" },
    });

    const job = await prisma.jobPost.create({
      data: {
        title,
        description,
        employer_id: employerProfile.id,
        industry_id,
        employment_type_id,
        salary_range,
        status_id: draftStatus!.id,
      },
    });
    res.status(201).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
export const getEmployerJobs = async (req: AuthRequest, res: Response) => {
  try {
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { user_id: req.user?.userId },
    });
    if (!employerProfile) {
      return res.status(404).json({ error: "Employer profile not found" });
    }
    const jobs = await prisma.jobPost.findMany({
      where: { employer_id: employerProfile.id },
      include: { status: true },
      orderBy: { created_at: "desc" },
    });
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const publishJob = async (req: AuthRequest, res: Response) => {
  try {
    const jobId = req.params.jobId as string;
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { user_id: req.user?.userId },
    });
    const job = await prisma.jobPost.findFirst({
      where: { id: jobId, employer_id: employerProfile?.id },
    });
    if (!job) return res.status(404).json({ error: "Job not found" });

    const openStatus = await prisma.jobPostStatus.findFirst({
      where: { status_name: "Open" },
    });
    const updated = await prisma.jobPost.update({
      where: { id: jobId },
      data: { status_id: openStatus!.id },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getApplicantsForJob = async (req: AuthRequest, res: Response) => {
  try {
    const jobId = req.params.jobId as string;
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { user_id: req.user?.userId },
    });
    const job = await prisma.jobPost.findFirst({
      where: { id: jobId, employer_id: employerProfile?.id },
    });
    if (!job) return res.status(404).json({ error: "Job not found" });

    const applications = await prisma.jobApplication.findMany({
      where: { job_id: jobId },
      include: {
        seeker: {
          include: { user: true }, // to get email etc.
        },
        status: true,
        notes: {
          include: { employer: { select: { company_name: true } } },
        },
      },
    });
    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateApplicationStatus = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const applicationId = req.params.applicationId as string;
    const { statusName } = req.body; // 'Interview', 'Accepted', 'Rejected'

    const employerProfile = await prisma.employerProfile.findUnique({
      where: { user_id: req.user?.userId },
    });

    const application = await prisma.jobApplication.findFirst({
      where: { id: applicationId, job: { employer_id: employerProfile?.id } },
      include: {
        seeker: { include: { user: true } },
        job: true,
      },
    });
    if (!application)
      return res.status(404).json({ error: "Application not found" });

    const status = await prisma.jobApplicationStatus.findFirst({
      where: { status_name: statusName },
    });
    if (!status) return res.status(400).json({ error: "Invalid status" });

    const updated = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status_id: status.id },
    });

    // Notify seeker
    await prisma.notification.create({
      data: {
        user_id: application.seeker.user.id,
        message: `Your application for ${application.job.title} has been updated to ${statusName}`,
        trigger_type: "Application",
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const addNoteToApplication = async (req: AuthRequest, res: Response) => {
  try {
    const applicationId = req.params.applicationId as string;
    const { noteText } = req.body;

    const employerProfile = await prisma.employerProfile.findUnique({
      where: { user_id: req.user?.userId },
    });
    const application = await prisma.jobApplication.findFirst({
      where: { id: applicationId, job: { employer_id: employerProfile?.id } },
    });
    if (!application)
      return res.status(404).json({ error: "Application not found" });

    const note = await prisma.jobApplicationNote.create({
      data: {
        application_id: applicationId,
        employer_id: employerProfile!.id,
        note_text: noteText,
      },
    });
    res.status(201).json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const exportApplicantsCSV = async (req: AuthRequest, res: Response) => {
  try {
    const jobId = req.params.jobId as string;
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { user_id: req.user?.userId },
    });
    const applications = await prisma.jobApplication.findMany({
      where: { job_id: jobId, job: { employer_id: employerProfile?.id } },
      include: {
        seeker: { include: { user: true } },
        status: true,
      },
    });

    // Convert to CSV
    const csvRows = [
      ["Name", "Email", "Status", "Applied At", "Resume URL", "Cover Letter"],
    ];
    for (const app of applications) {
      csvRows.push([
        app.seeker.full_name,
        app.seeker.user?.email || "",
        app.status.status_name,
        app.applied_at.toISOString(),
        app.resume_url || "",
        app.cover_letter || "",
      ]);
    }
    const csvContent = csvRows.map((row) => row.join(",")).join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=applicants_job_${jobId}.csv`,
    );
    res.send(csvContent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
