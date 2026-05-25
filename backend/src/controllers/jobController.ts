import { Request, Response } from "express";
import prisma from "../lib/prisma";
import cloudinary from "../config/cloudinary";

// ==================== Public Controllers ====================

// GET /api/jobs - List all active jobs with filters & pagination
export const getJobs = async (req: Request, res: Response) => {
  try {
    const { keyword, location, industry, page = "1", limit = "10" } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {
      status: { status_name: "Open" }, // only active jobs
    };

    if (keyword) {
      where.OR = [
        { title: { contains: keyword as string, mode: "insensitive" } },
        { description: { contains: keyword as string, mode: "insensitive" } },
      ];
    }
    if (location) {
      where.location = { contains: location as string, mode: "insensitive" };
    }
    if (industry) {
      where.industry = { industry_name: industry as string };
    }

    const jobs = await prisma.jobPost.findMany({
      where,
      include: {
        employer: {
          include: { user: true },
        },
        industry: true,
        employment_type: true,
      },
      skip,
      take,
      orderBy: { created_at: "desc" },
    });

    const total = await prisma.jobPost.count({ where });

    res.json({
      jobs,
      total,
      page: parseInt(page as string),
      limit: take,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/jobs/search - Alternative search endpoint (simple)
export const searchJobs = async (req: Request, res: Response) => {
  try {
    const { keyword, location, industry } = req.query;
    const where: any = { status: { status_name: "Open" } };

    if (keyword) {
      where.OR = [
        { title: { contains: keyword as string, mode: "insensitive" } },
        { description: { contains: keyword as string, mode: "insensitive" } },
      ];
    }
    if (location) {
      where.location = { contains: location as string, mode: "insensitive" };
    }
    if (industry) {
      where.industry = { industry_name: industry as string };
    }

    const jobs = await prisma.jobPost.findMany({
      where,
      include: {
        employer: { include: { user: true } },
        industry: true,
        employment_type: true,
      },
      orderBy: { created_at: "desc" },
    });

    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/jobs/:id - Get single job details
export const getJobById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!id) return res.status(400).json({ message: "Job ID is required" });
    const job = await prisma.jobPost.findUnique({
      where: { id },
      include: {
        employer: {
          include: { user: true },
        },
        industry: true,
        employment_type: true,
        status: true,
      },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================== Employer-Only Controllers ====================

// POST /api/jobs - Create a new job (with optional logo upload)
export const createJob = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const employer = await prisma.employerProfile.findUnique({
      where: { user_id: user.id },
    });
    if (!employer) {
      return res.status(403).json({ message: "Employer profile not found" });
    }

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
      experience_level,
      skills,
      require_resume,
    } = req.body;

    // Parse skills if sent as JSON string
    let parsedSkills: string[] = [];
    if (skills) {
      parsedSkills = Array.isArray(skills) ? skills : JSON.parse(skills);
    }

    // Upload logo if present
    let logoUrl = null;
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "job-portal/logos" },
          (err, result) => (err ? reject(err) : resolve(result)),
        );
        stream.end(req.file!.buffer);
      });
      logoUrl = (result as any).secure_url;
    }

    const job = await prisma.jobPost.create({
      data: {
        title,
        description,
        employer_id: employer.id,
        industry_id: parseInt(industry_id as string),
        employment_type_id: parseInt(employment_type_id as string),
        salary_range: salary_range || null,
        status_id: 2, // "Open" (adjust if your seed uses different ID)
        jobSite: jobSite || null,
        experienceLevel: experienceLevel || null,
        educationLevel: educationLevel || null,
        genderPreference: genderPreference || null,
        requirements: requirements || null,
        application_deadline: application_deadline
          ? new Date(application_deadline as string)
          : null,
        show_salary: show_salary === "true",
        highlight_job: highlight_job === "true",
        allow_remote: allow_remote === "true",
        budget_type: budget_type || null,
        budget_min: budget_min ? parseFloat(budget_min as string) : null,
        budget_max: budget_max ? parseFloat(budget_max as string) : null,
        duration: duration || null,
        experience_level: experience_level || null,
        skills: parsedSkills,
        require_resume: require_resume === "true",
        attachments: logoUrl ? [logoUrl] : [],
      },
    });

    res.status(201).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Job creation failed" });
  }
};

// PUT /api/jobs/:id - Update a job (employer only)
export const updateJob = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const id = req.params.id as string; // ✅ fixed: cast to string
    if (!id) return res.status(400).json({ message: "Job ID is required" });

    const employer = await prisma.employerProfile.findUnique({
      where: { user_id: user.id },
    });
    if (!employer) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const job = await prisma.jobPost.findFirst({
      where: { id, employer_id: employer.id }, // ✅ id is now string
    });
    if (!job) {
      return res.status(404).json({ message: "Job not found or not yours" });
    }

    // Destructure only allowed update fields
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
      experience_level,
      skills,
      require_resume,
    } = req.body;

    const updated = await prisma.jobPost.update({
      where: { id }, // ✅ id is string
      data: {
        title,
        description,
        industry_id: industry_id ? parseInt(industry_id) : undefined,
        employment_type_id: employment_type_id
          ? parseInt(employment_type_id)
          : undefined,
        salary_range,
        jobSite,
        experienceLevel,
        educationLevel,
        genderPreference,
        requirements,
        application_deadline: application_deadline
          ? new Date(application_deadline)
          : undefined,
        show_salary:
          show_salary !== undefined ? show_salary === "true" : undefined,
        highlight_job:
          highlight_job !== undefined ? highlight_job === "true" : undefined,
        allow_remote:
          allow_remote !== undefined ? allow_remote === "true" : undefined,
        budget_type,
        budget_min: budget_min ? parseFloat(budget_min) : undefined,
        budget_max: budget_max ? parseFloat(budget_max) : undefined,
        duration,
        experience_level,
        skills: skills
          ? Array.isArray(skills)
            ? skills
            : JSON.parse(skills)
          : undefined,
        require_resume:
          require_resume !== undefined ? require_resume === "true" : undefined,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update failed" });
  }
};

// DELETE /api/jobs/:id - Delete a job (employer only)
export const deleteJob = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const id = req.params.id as string; // ✅ fixed: cast to string
    if (!id) return res.status(400).json({ message: "Job ID is required" });

    const employer = await prisma.employerProfile.findUnique({
      where: { user_id: user.id },
    });
    if (!employer) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const job = await prisma.jobPost.findFirst({
      where: { id, employer_id: employer.id }, // ✅ id is string
    });
    if (!job) {
      return res.status(404).json({ message: "Job not found or not yours" });
    }

    await prisma.jobPost.delete({ where: { id } }); // ✅ id is string
    res.json({ message: "Job deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Delete failed" });
  }
};
