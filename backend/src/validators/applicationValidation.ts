import { z } from "zod";

export const applyJobSchema = z.object({
  jobId: z.string().uuid(),
  coverLetter: z.string().max(5000).optional(),
});

export const updateApplicationStatusSchema = z.object({
  statusName: z.enum(["Interview", "Accepted", "Rejected"]),
});

export const addNoteSchema = z.object({
  noteText: z.string().min(1).max(1000),
});
