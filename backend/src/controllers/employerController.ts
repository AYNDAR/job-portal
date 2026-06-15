import { Request, Response } from "express";
import prisma from "../lib/prisma";
import cloudinary from "../config/cloudinary";
import { AuthRequest } from "../middlewares/authMiddleware";

// Extend Express Request to include Multer file(s)
interface MulterRequest extends Request {
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

// ==================== Job Management ====================

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

// Single updateEmployerProfile function (with description)
export const updateEmployerProfile = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const {
      company_name,
      website,
      logo_url,
      industry_id,
      location,
      description,
    } = req.body;
    const updated = await prisma.employerProfile.update({
      where: { user_id: req.user?.userId },
      data: {
        company_name,
        website,
        logo_url,
        industry_id,
        location,
        description,
      },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

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

// ==================== Dashboard Stats & Activities (for employer overview) ====================

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const employer = await prisma.employerProfile.findUnique({
      where: { user_id: req.user?.userId },
    });
    if (!employer) return res.status(404).json({ error: "Employer not found" });

    const [
      activeJobs,
      totalApplications,
      pendingReviews,
      interviewsScheduled,
      acceptedCandidates,
    ] = await Promise.all([
      prisma.jobPost.count({
        where: { employer_id: employer.id, status: { status_name: "Open" } },
      }),
      prisma.jobApplication.count({
        where: { job: { employer_id: employer.id } },
      }),
      prisma.jobApplication.count({
        where: {
          job: { employer_id: employer.id },
          status: { status_name: "Pending" },
        },
      }),
      prisma.jobApplication.count({
        where: {
          job: { employer_id: employer.id },
          status: { status_name: "Interview" },
        },
      }),
      prisma.jobApplication.count({
        where: {
          job: { employer_id: employer.id },
          status: { status_name: "Accepted" },
        },
      }),
    ]);
    res.json({
      activeJobs,
      totalApplications,
      pendingReviews,
      interviewsScheduled,
      acceptedCandidates,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

export const getDashboardActivities = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const employer = await prisma.employerProfile.findUnique({
      where: { user_id: req.user?.userId },
    });
    if (!employer) return res.status(404).json({ error: "Employer not found" });

    const [applications, recentJobs] = await Promise.all([
      prisma.jobApplication.findMany({
        where: { job: { employer_id: employer.id } },
        include: { job: true, seeker: true },
        orderBy: { applied_at: "desc" },
        take: 10,
      }),
      prisma.jobPost.findMany({
        where: { employer_id: employer.id },
        orderBy: { created_at: "desc" },
        take: 5,
      }),
    ]);

    const activities = [
      ...applications.map((app) => ({
        id: `app-${app.id}`,
        type: "application" as const,
        title: `New application from ${app.seeker.full_name} for ${app.job.title}`,
        timestamp: app.applied_at,
      })),
      ...recentJobs.map((job) => ({
        id: `job-${job.id}`,
        type: "job" as const,
        title: `Job posted: ${job.title}`,
        timestamp: job.created_at,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 10);

    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
};

// ==================== Upload Controllers ====================

export const uploadCompanyLogo = async (req: MulterRequest, res: Response) => {
  try {
    const userId = (req as any).user.id;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "job-portal/logos",
          transformation: [{ width: 200, height: 200, crop: "limit" }],
        },
        (err: any, result: any) => (err ? reject(err) : resolve(result)),
      );
      stream.end(req.file!.buffer);
    });

    const logoUrl = (result as any).secure_url;

    await prisma.employerProfile.update({
      where: { user_id: userId },
      data: { logo_url: logoUrl },
    });

    res.json({ logoUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Logo upload failed" });
  }
};

export const uploadJobAttachments = async (
  req: MulterRequest,
  res: Response,
) => {
  try {
    const userId = (req as any).user?.id as string;
    const jobId = req.params.jobId as string;

    if (!userId || !jobId) {
      return res.status(400).json({ message: "Missing user or job ID" });
    }

    const job = await prisma.jobPost.findFirst({
      where: { id: jobId, employer: { user_id: userId } },
    });
    if (!job) {
      return res.status(404).json({ message: "Job not found or not yours" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadedUrls = [];
    for (const file of req.files) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: `job-portal/jobs/${jobId}` },
          (err: any, result: any) => (err ? reject(err) : resolve(result)),
        );
        stream.end(file.buffer);
      });
      uploadedUrls.push((result as any).secure_url);
    }

    const newAttachments = [...(job.attachments || []), ...uploadedUrls];
    await prisma.jobPost.update({
      where: { id: jobId },
      data: { attachments: newAttachments },
    });

    res.json({ attachments: newAttachments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Attachment upload failed" });
  }
};
