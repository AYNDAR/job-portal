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
      jobSite,
      experienceLevel,
      educationLevel,
      genderPreference,
      requirements,
      application_deadline,
      show_salary,
      highlight_job,
      allow_remote,
      budget_type,
      budget_min,
      budget_max,
      duration,
      skills,
      require_resume,
    } = req.body;

    // Get employer profile
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
        jobSite,
        experienceLevel,
        educationLevel,
        genderPreference,
        requirements,
        application_deadline: application_deadline
          ? new Date(application_deadline)
          : null,
        show_salary: show_salary ?? true,
        highlight_job: highlight_job ?? false,
        allow_remote: allow_remote ?? false,
        budget_type,
        budget_min,
        budget_max,
        duration,
        skills: skills || [],
        require_resume: require_resume ?? false,
        status_id: draftStatus!.id,
      },
    });
    res.status(201).json(job);
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

export const getEmployerJobs = async (req: AuthRequest, res: Response) => {
  try {
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { user_id: req.user?.userId },
    });
    if (!employerProfile)
      return res.status(404).json({ error: "Employer profile not found" });

    const jobs = await prisma.jobPost.findMany({
      where: { employer_id: employerProfile.id },
      include: { status: true, industry: true, employment_type: true },
      orderBy: { created_at: "desc" },
    });
    res.json(jobs);
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
        seeker: { include: { user: true } },
        status: true,
        notes: { include: { employer: { select: { company_name: true } } } },
      },
    });
    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
export const getRecentApplicants = async (req: AuthRequest, res: Response) => {
  try {
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { user_id: req.user?.userId },
    });
    if (!employerProfile)
      return res.status(404).json({ error: "Employer profile not found" });

    const applicants = await prisma.jobApplication.findMany({
      where: { job: { employer_id: employerProfile.id } },
      include: {
        seeker: true,
        job: { select: { title: true } },
        status: true,
      },
      orderBy: { applied_at: "desc" },
      take: 5,
    });
    res.json(applicants);
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
    const { statusName } = req.body;
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { user_id: req.user?.userId },
    });
    const application = await prisma.jobApplication.findFirst({
      where: { id: applicationId, job: { employer_id: employerProfile?.id } },
      include: { seeker: { include: { user: true } }, job: true },
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
      include: { seeker: { include: { user: true } }, status: true },
    });
    const rows = [
      ["Name", "Email", "Status", "Applied At", "Resume URL", "Cover Letter"],
    ];
    for (const app of applications) {
      rows.push([
        app.seeker.full_name,
        app.seeker.user?.email || "",
        app.status.status_name,
        app.applied_at.toISOString(),
        app.resume_url || "",
        app.cover_letter || "",
      ]);
    }
    const csv = rows.map((r) => r.join(",")).join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=applicants_${jobId}.csv`,
    );
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getEmployerStats = async (req: AuthRequest, res: Response) => {
  try {
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { user_id: req.user?.userId },
    });
    if (!employerProfile)
      return res.status(404).json({ error: "Employer profile not found" });

    const activeJobs = await prisma.jobPost.count({
      where: {
        employer_id: employerProfile.id,
        status: { status_name: "Open" },
      },
    });
    const totalApplications = await prisma.jobApplication.count({
      where: { job: { employer_id: employerProfile.id } },
    });
    const shortlisted = await prisma.jobApplication.count({
      where: {
        job: { employer_id: employerProfile.id },
        status: { status_name: "Interview" },
      },
    });
    const interviewsScheduled = shortlisted;

    res.json({
      activeJobs,
      totalApplications,
      shortlisted,
      interviewsScheduled,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
// Get employer profile
export const getEmployerProfile = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.employerProfile.findUnique({
      where: { user_id: req.user?.userId },
      include: { industry: true },
    });
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update employer profile
export const updateEmployerProfile = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { company_name, website, logo_url, industry_id, location } = req.body;
    const updated = await prisma.employerProfile.update({
      where: { user_id: req.user?.userId },
      data: { company_name, website, logo_url, industry_id, location },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get application stats for charts (last 6 months)
export const getEmployerApplicationStats = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { user_id: req.user?.userId },
    });
    if (!employerProfile)
      return res.status(404).json({ error: "Employer not found" });

    const months = 6;
    const data = [];
    for (let i = months - 1; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      const count = await prisma.jobApplication.count({
        where: {
          job: { employer_id: employerProfile.id },
          applied_at: { gte: start, lt: end },
        },
      });
      data.push({
        month: start.toLocaleString("default", { month: "short" }),
        count,
      });
    }
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get job post stats for charts
export const getEmployerJobPostStats = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { user_id: req.user?.userId },
    });
    if (!employerProfile)
      return res.status(404).json({ error: "Employer not found" });

    const months = 6;
    const data = [];
    for (let i = months - 1; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      const count = await prisma.jobPost.count({
        where: {
          employer_id: employerProfile.id,
          created_at: { gte: start, lt: end },
        },
      });
      data.push({
        month: start.toLocaleString("default", { month: "short" }),
        count,
      });
    }
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
