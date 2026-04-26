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
