// features/jobSeeker/types/index.ts

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryRange?: string;
  employmentType: string;
  industry: string;
  description: string;
}

export interface Bookmark {
  jobId: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  status: "Pending" | "Interview" | "Accepted" | "Rejected";
  appliedAt: string;
}

export interface JobFilters {
  keyword?: string;
  industry?: string;
  location?: string;
  type?: string;
}
