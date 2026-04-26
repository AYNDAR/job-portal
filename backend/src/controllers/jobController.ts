import { Request, Response } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../middlewares/authMiddleware";

export const searchJobs = async (req: Request, res: Response) => {
  try {
    const {
      title,
      industry,
      location,
      type,
      salary,
      page = 1,
      limit = 20,
    } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {
      status: { status_name: "Open" },
    };

    if (title && typeof title === "string") {
      where.title = { contains: title, mode: "insensitive" };
    }
    if (location && typeof location === "string") {
      where.employer = {
        location: { contains: location, mode: "insensitive" },
      };
    }
    if (type && typeof type === "string") {
      // type is employment type name (e.g., "Full-time")
      where.employment_type = { type_name: type };
    }
    if (salary && typeof salary === "string") {
      where.salary_range = { contains: salary, mode: "insensitive" };
    }
    // Handle industry name -> ID lookup
    if (industry && typeof industry === "string") {
      const industryRecord = await prisma.jobIndustry.findFirst({
        where: { industry_name: industry },
      });
      if (industryRecord) {
        where.industry_id = industryRecord.id;
      } else {
        // If industry name not found, return empty results
        return res.json({
          data: [],
          pagination: { page: 1, limit: take, total: 0, pages: 0 },
        });
      }
    }

    const jobs = await prisma.jobPost.findMany({
      where,
      skip,
      take,
      include: {
        employer: {
          select: { company_name: true, logo_url: true, location: true },
        },
        industry: true,
        employment_type: true,
      },
      orderBy: { created_at: "desc" },
    });

    const total = await prisma.jobPost.count({ where });

    // Log search query (optional)
    await prisma.searchLog.create({
      data: {
        user_id: (req as AuthRequest).user?.userId,
        query_text: (title as string) || "",
        filters: JSON.stringify({ industry, location, type, salary }),
      },
    });

    res.json({
      data: jobs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const job = await prisma.jobPost.findUnique({
      where: { id },
      include: {
        employer: {
          select: {
            company_name: true,
            logo_url: true,
            website: true,
            location: true,
          },
        },
        industry: true,
        employment_type: true,
      },
    });
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
