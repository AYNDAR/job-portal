import { Request, Response } from "express";
import { prisma } from "../config/database";
import { hashPassword, comparePassword } from "../utils/hashPassword";
import { generateToken } from "../utils/generateJWT";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, userType, fullName, companyName } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ error: "Email already registered" });

    const userTypeRecord = await prisma.userType.findFirst({
      where: { type_name: userType },
    });
    if (!userTypeRecord)
      return res.status(400).json({ error: "Invalid user type" });

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashed, user_type_id: userTypeRecord.id },
    });

    if (userType === "Job Seeker") {
      await prisma.jobSeekerProfile.create({
        data: { user_id: user.id, full_name: fullName || "", skills: [] },
      });
    } else if (userType === "Employer") {
      await prisma.employerProfile.create({
        data: {
          user_id: user.id,
          company_name: companyName || "",
          industry_id: 1,
          location: "",
        },
      });
    }

    const token = generateToken(user.id, user.user_type_id);
    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        userType: userTypeRecord.type_name,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { user_type: true }, // ✅ critical
    });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const valid = await comparePassword(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });
    const token = generateToken(user.id, user.user_type_id);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        userType: user.user_type.type_name, // "Job Seeker", "Employer", "Admin", "Super Admin"
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
