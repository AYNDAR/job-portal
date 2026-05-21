// src/features/jobSeeker/jobSeekerSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

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

// ===== MOCK DATA =====
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

// ===== ASYNC THUNKS (return mock data directly) =====
export const fetchJobs = createAsyncThunk<Job[], JobFilters>(
  "jobSeeker/fetchJobs",
  async (filters) => {
    // Apply simple filtering
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
    return { jobId };
  },
);

export const fetchBookmarks = createAsyncThunk<Bookmark[]>(
  "jobSeeker/fetchBookmarks",
  async () => {
    return mockBookmarks;
  },
);

export const fetchApplications = createAsyncThunk<Application[]>(
  "jobSeeker/fetchApplications",
  async () => {
    return mockApplications;
  },
);

// ===== SLICE =====
interface JobSeekerState {
  jobs: Job[];
  bookmarks: Bookmark[];
  applications: Application[];
  loading: boolean;
  error: string | null;
}

const initialState: JobSeekerState = {
  jobs: [],
  bookmarks: [],
  applications: [],
  loading: false,
  error: null,
};

const jobSeekerSlice = createSlice({
  name: "jobSeeker",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobs.fulfilled, (state, action: PayloadAction<Job[]>) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state) => {
        state.loading = false;
      })
      .addCase(searchJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchJobs.fulfilled, (state, action: PayloadAction<Job[]>) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(searchJobs.rejected, (state) => {
        state.loading = false;
      })
      .addCase(
        applyToJob.fulfilled,
        (state, action: PayloadAction<Application>) => {
          state.applications.push(action.payload);
        },
      )
      .addCase(
        bookmarkJob.fulfilled,
        (state, action: PayloadAction<{ jobId: string }>) => {
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
        },
      )
      .addCase(
        fetchBookmarks.fulfilled,
        (state, action: PayloadAction<Bookmark[]>) => {
          state.bookmarks = action.payload;
        },
      )
      .addCase(
        fetchApplications.fulfilled,
        (state, action: PayloadAction<Application[]>) => {
          state.applications = action.payload;
        },
      );
  },
});

export default jobSeekerSlice.reducer;
