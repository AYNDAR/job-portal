// src/features/jobSeeker/jobSeekerSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../services/api";
// import api from "../../services/api"; // TODO: Uncomment when backend endpoints are ready

// ===== TYPES =====
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

export interface Company {
  id: string;
  name: string;
  industry: string;
  jobsCount: number;
  verified: boolean;
  logo?: string;
}

// ===== MOCK DATA (fallback when backend is not ready) =====
const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp",
    location: "New York, NY",
    salaryRange: "$120k - $150k",
    employmentType: "Full-time",
    industry: "Technology",
    description:
      "Looking for an experienced React developer to lead our frontend team.",
  },
  {
    id: "2",
    title: "Full Stack Engineer",
    company: "StartupX",
    location: "San Francisco, CA (Remote)",
    salaryRange: "$140k - $180k",
    employmentType: "Remote",
    industry: "Technology",
    description:
      "Join our fast-growing startup to build both frontend and backend systems.",
  },
];

const mockApplications: Application[] = [];
const mockBookmarks: Bookmark[] = [];

// ===== ASYNC THUNKS =====
export const fetchJobs = createAsyncThunk<Job[], JobFilters>(
  "jobSeeker/fetchJobs",
  async (filters) => {
    let filtered = [...mockJobs];
    if (filters.keyword) {
      filtered = filtered.filter((job) =>
        job.title.toLowerCase().includes(filters.keyword!.toLowerCase()),
      );
    }
    if (filters.location) {
      filtered = filtered.filter((job) =>
        job.location.toLowerCase().includes(filters.location!.toLowerCase()),
      );
    }
    return filtered;
  },
);

export const searchJobs = createAsyncThunk<Job[], JobFilters>(
  "jobSeeker/searchJobs",
  async (filters) => {
    const params = new URLSearchParams();
    if (filters.keyword) params.append("keyword", filters.keyword);
    if (filters.location) params.append("location", filters.location);
    if (filters.industry) params.append("industry", filters.industry);
    const response = await api.get(`/jobs?${params.toString()}`);
    // Backend returns { jobs: [...] } or just [...]
    const jobsData = response.data.jobs || response.data;
    // Map backend fields to frontend Job interface if needed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return jobsData.map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.employer?.company_name || job.company,
      location: job.location,
      salaryRange: job.salary_range || job.salaryRange,
      employmentType: job.employment_type?.type_name || job.employmentType,
      industry: job.industry?.industry_name || job.industry,
      description: job.description,
    }));
  },
);

export const applyToJob = createAsyncThunk<
  Application,
  { jobId: string; coverLetter: string; resumeUrl: string }
>("jobSeeker/applyToJob", async ({ jobId }) => {
  const job = mockJobs.find((j) => j.id === jobId);
  return {
    id: `app_${Date.now()}`,
    jobId,
    jobTitle: job?.title || "",
    status: "Pending",
    appliedAt: new Date().toISOString(),
  };
});

export const bookmarkJob = createAsyncThunk<{ jobId: string }, string>(
  "jobSeeker/bookmarkJob",
  async (jobId) => {
    await api.post(`/jobs/${jobId}/bookmark`);
    return { jobId };
  },
);

export const fetchBookmarks = createAsyncThunk<Bookmark[]>(
  "jobSeeker/fetchBookmarks",
  async () => {
    const response = await api.get("/jobseeker/bookmarks");
    return response.data;
  },
);

export const fetchApplications = createAsyncThunk<Application[]>(
  "jobSeeker/fetchApplications",
  async () => {
    return mockApplications;
  },
);

export const fetchCompanies = createAsyncThunk<Company[]>(
  "jobSeeker/fetchCompanies",
  async () => {
    // Mock company data – replace with real API call later
    const mockCompanies: Company[] = [
      {
        id: "1",
        name: "TechCorp",
        industry: "Technology",
        jobsCount: 24,
        verified: true,
      },
      {
        id: "2",
        name: "HealthPlus",
        industry: "Healthcare",
        jobsCount: 18,
        verified: true,
      },
      {
        id: "3",
        name: "FinEdge",
        industry: "Finance",
        jobsCount: 15,
        verified: true,
      },
      {
        id: "4",
        name: "Designify",
        industry: "Design",
        jobsCount: 11,
        verified: false,
      },
    ];
    return mockCompanies;
  },
);

// ===== SLICE STATE =====
interface JobSeekerState {
  jobs: Job[];
  bookmarks: Bookmark[];
  applications: Application[];
  companies: Company[];
  loading: boolean;
  error: string | null;
}

const initialState: JobSeekerState = {
  jobs: [],
  bookmarks: [],
  applications: [],
  companies: [],
  loading: false,
  error: null,
};

// ===== SLICE =====
const jobSeekerSlice = createSlice({
  name: "jobSeeker",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(searchJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchJobs.fulfilled, (state, action: PayloadAction<Job[]>) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(searchJobs.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load jobs";
      })
      .addCase(bookmarkJob.fulfilled, (state, action) => {
        const exists = state.bookmarks.some(
          (b) => b.jobId === action.payload.jobId,
        );
        if (!exists) {
          state.bookmarks.push({ jobId: action.payload.jobId });
        } else {
          state.bookmarks = state.bookmarks.filter(
            (b) => b.jobId !== action.payload.jobId,
          );
        }
      })
      .addCase(fetchBookmarks.fulfilled, (state, action) => {
        state.bookmarks = action.payload;
      });
  },
});
export default jobSeekerSlice.reducer;
