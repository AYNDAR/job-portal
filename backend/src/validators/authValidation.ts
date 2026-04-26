import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  userType: z.enum(["Job Seeker", "Employer", "Admin", "Super Admin"]),
  fullName: z.string().optional(),
  companyName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
