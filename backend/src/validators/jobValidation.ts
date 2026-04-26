import { z } from "zod";

export const postJobSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(50, "Description must be at least 50 characters"),
  industry_id: z.number().int().positive(),
  employment_type_id: z.number().int().positive(),
  salary_range: z.string().optional(),
});

export const updateJobSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(50).optional(),
  industry_id: z.number().int().positive().optional(),
  employment_type_id: z.number().int().positive().optional(),
  salary_range: z.string().optional(),
  status: z.enum(["Draft", "Open", "Closed"]).optional(),
});
