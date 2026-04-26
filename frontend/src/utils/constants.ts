export const USER_TYPES = {
  JOB_SEEKER: "Job Seeker",
  EMPLOYER: "Employer",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
} as const;

export const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Remote",
  "Contract",
  "Internship",
] as const;

export const JOB_STATUSES = {
  DRAFT: "Draft",
  OPEN: "Open",
  CLOSED: "Closed",
} as const;

export const APPLICATION_STATUSES = {
  PENDING: "Pending",
  INTERVIEW: "Interview",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
} as const;

export const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Construction",
] as const;
