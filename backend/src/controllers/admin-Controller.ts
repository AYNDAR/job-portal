import { Response } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../middlewares/authMiddleware";
import bcrypt from "bcryptjs";

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        user_type: true,
        job_seeker_profile: true,
        employer_profile: true,
      },
      orderBy: { created_at: "desc" },
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const suspendUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const random = await bcrypt.hash(Math.random().toString(36), 10);
    const user = await prisma.user.update({
      where: { id: userId },
      data: { password: random },
    });
    res.json({ message: "User suspended", userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getAllJobs = async (req: AuthRequest, res: Response) => {
  try {
    const jobs = await prisma.jobPost.findMany({
      include: {
        employer: true,
        industry: true,
        employment_type: true,
        status: true,
      },
      orderBy: { created_at: "desc" },
    });
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
export const getEmployers = async (req: AuthRequest, res: Response) => {
  const employers = await prisma.user.findMany({
    where: { user_type_id: 2 },
    include: { employer_profile: { include: { industry: true } } },
  });
  res.json(
    employers.map((u) => ({
      id: u.id,
      email: u.email,
      company_name: u.employer_profile?.company_name,
      industry: u.employer_profile?.industry,
      location: u.employer_profile?.location,
      created_at: u.created_at,
    })),
  );
};

export const closeJob = async (req: AuthRequest, res: Response) => {
  try {
    const jobId = req.params.jobId as string;
    const closedStatus = await prisma.jobPostStatus.findFirst({
      where: { status_name: "Closed" },
    });
    if (!closedStatus)
      return res.status(500).json({ error: "Closed status not found" });
    const job = await prisma.jobPost.update({
      where: { id: jobId },
      data: { status_id: closedStatus.id },
    });
    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
export const getRecentJobs = async (req: AuthRequest, res: Response) => {
  const jobs = await prisma.jobPost.findMany({
    take: 5,
    orderBy: { created_at: "desc" },
    include: { employer: { select: { company_name: true } } },
  });
  res.json(jobs);
};

export const getRecentUsers = async (req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    take: 5,
    orderBy: { created_at: "desc" },
    include: { user_type: true },
  });
  res.json(users);
};
export const getAdminProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      select: { id: true, email: true, created_at: true },
    });
    if (!user) return res.status(404).json({ error: "Admin not found" });
    res.json({ name: user.email.split("@")[0], email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateAdminProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email } = req.body;
    // Update user's email (if provided) – name is just for display, not stored in our model.
    // For simplicity, we only update email.
    if (email) {
      await prisma.user.update({
        where: { id: req.user?.userId },
        data: { email },
      });
    }
    res.json({ message: "Profile updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const changeAdminPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Current password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user?.userId },
      data: { password: hashed },
    });
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getAdminStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalJobs = await prisma.jobPost.count();
    const totalApplications = await prisma.jobApplication.count();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await prisma.user.count({
      where: { created_at: { gte: sevenDaysAgo } },
    });
    res.json({ totalUsers, totalJobs, totalApplications, recentUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// ========== Super Admin only: manage admin accounts ==========

export const getAdminUsers = async (req: AuthRequest, res: Response) => {
  try {
    const adminUsers = await prisma.user.findMany({
      where: { user_type_id: 3 }, // Admin type ID
      select: { id: true, email: true, created_at: true },
      orderBy: { created_at: "desc" },
    });
    res.json(adminUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const createAdminUser = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res.status(400).json({ error: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.user.create({
      data: {
        email,
        password: hashed,
        user_type_id: 3, // Admin
      },
      select: { id: true, email: true, created_at: true },
    });
    res.status(201).json(newAdmin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
export const getAllApplications = async (req: AuthRequest, res: Response) => {
  const applications = await prisma.jobApplication.findMany({
    include: {
      job: { include: { employer: true } },
      seeker: true,
      status: true,
    },
    orderBy: { applied_at: "desc" },
  });
  res.json(applications);
};

export const updateAdminUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = id as string; // cast to string
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: "Password required" });

    const hashed = await bcrypt.hash(password, 10);
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
      select: { id: true, email: true },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteAdminUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = id as string;
    // Prevent deleting yourself
    if (userId === req.user?.userId) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }
    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: "Admin user deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getRegistrationStats = async (req: AuthRequest, res: Response) => {
  try {
    const months = 6;
    const data = [];
    for (let i = months - 1; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      const count = await prisma.user.count({
        where: { created_at: { gte: start, lt: end } },
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

export const getJobPostStats = async (req: AuthRequest, res: Response) => {
  try {
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
        where: { created_at: { gte: start, lt: end } },
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

export const getApplicationStats = async (req: AuthRequest, res: Response) => {
  try {
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
        where: { applied_at: { gte: start, lt: end } },
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

export const getTopCategories = async (req: AuthRequest, res: Response) => {
  try {
    const top = await prisma.jobPost.groupBy({
      by: ["industry_id"],
      _count: { industry_id: true },
      orderBy: { _count: { industry_id: "desc" } },
      take: 5,
    });
    const industries = await prisma.jobIndustry.findMany({
      where: { id: { in: top.map((t) => t.industry_id) } },
    });
    const result = top.map((t) => ({
      name:
        industries.find((i) => i.id === t.industry_id)?.industry_name ||
        "Unknown",
      count: t._count.industry_id,
    }));
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
