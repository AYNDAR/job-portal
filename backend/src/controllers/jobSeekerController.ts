import { Request, Response } from "express";
import prisma from "../lib/prisma";

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
export const updateJobSeekerProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      fullName,
      title,
      bio,
      phone,
      location,
      website,
      linkedin,
      github,
      avatarUrl,
      skills,
      certificates,
      projects,
      education,
      experience,
      languages,
      availability,
      expectedSalary,
    } = req.body;

    const updated = await prisma.jobSeekerProfile.update({
      where: { user_id: userId },
      data: {
        full_name: fullName,
        title,
        bio,
        phone,
        location,
        website,
        linkedin,
        github,
        avatar_url: avatarUrl,
        skills,
        certificates,
        projects,
        education,
        experience,
        languages,
        availability,
        expected_salary: expectedSalary,
      },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};
