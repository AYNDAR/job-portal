import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

// GET /api/jobseeker/profile
export const getJobSeekerProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const profile = await prisma.jobSeekerProfile.findUnique({
      where: { user_id: userId },
    });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// PUT /api/jobseeker/profile
export const updateJobSeekerProfile = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    const data = req.body;
    const updateData: any = {};
    if (data.fullName !== undefined) updateData.full_name = data.fullName;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.linkedin !== undefined) updateData.linkedin = data.linkedin;
    if (data.github !== undefined) updateData.github = data.github;
    if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl; // ✅ ADD THIS
    if (data.resume_url !== undefined) updateData.resume_url = data.resume_url;
    // ... other fields
    const updated = await prisma.jobSeekerProfile.update({
      where: { user_id: userId },
      data: updateData,
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};
