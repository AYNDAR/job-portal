/* eslint-disable @typescript-eslint/no-explicit-any */
// src/features/jobSeeker/jobSeekerSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../services/api";

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

// ===== ASYNC THUNKS =====

export const fetchJobs = createAsyncThunk<Job[], JobFilters>(
  "jobSeeker/fetchJobs",
  async (filters) => {
    const params = new URLSearchParams();
    if (filters.keyword) params.append("keyword", filters.keyword);
    if (filters.location) params.append("location", filters.location);
    if (filters.industry) params.append("industry", filters.industry);
    const response = await api.get(`/jobs?${params.toString()}`);
    const jobsData = response.data.jobs || response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return jobsData.map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.employer?.company_name || job.company || "",
      location: job.location || "",
      salaryRange: job.salary_range || job.salaryRange || "",
      employmentType:
        job.employment_type?.type_name || job.employmentType || "",
      industry: job.industry?.industry_name || job.industry || "",
      description: job.description || "",
    }));
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
    const jobsData = response.data.jobs || response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return jobsData.map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.employer?.company_name || job.company || "",
      location: job.location || "",
      salaryRange: job.salary_range || job.salaryRange || "",
      employmentType:
        job.employment_type?.type_name || job.employmentType || "",
      industry: job.industry?.industry_name || job.industry || "",
      description: job.description || "",
    }));
  },
);

export const bookmarkJob = createAsyncThunk<
  { jobId: string; bookmarked: boolean },
  string
>("jobSeeker/bookmarkJob", async (jobId) => {
  // FIX: correct endpoint matches jobseekerRoutes.ts
  const res = await api.post(`/jobseeker/bookmarks/${jobId}`);
  return { jobId, bookmarked: res.data.bookmarked };
});

// ✅ FIXED: fetchBookmarks now uses the correct endpoint and maps the response
export const fetchBookmarks = createAsyncThunk<Bookmark[]>(
  "jobSeeker/fetchBookmarks",
  async () => {
    // FIX: correct endpoint matches jobseekerRoutes.ts
    const response = await api.get("/jobseeker/bookmarks");
    const data = Array.isArray(response.data) ? response.data : [];
    return data.map((bm: any) => ({
      // Backend now returns { jobId, job: { id, title, company, ... } }
      jobId: bm.jobId || bm.job_id || bm.job?.id || "",
      job: bm.job || undefined,
    }));
  },
);

// ✅ FIXED: fetchApplications now uses the REAL API endpoint
export const fetchApplications = createAsyncThunk<Application[]>(
  "jobSeeker/fetchApplications",
  async () => {
    const response = await api.get("/applications/my-applications");
    let data = response.data;
    // Handle different possible response shapes
    if (Array.isArray(data)) {
      // already array
    } else if (data.data && Array.isArray(data.data)) {
      data = data.data;
    } else if (data.applications && Array.isArray(data.applications)) {
      data = data.applications;
    } else {
      data = [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((app: any) => ({
      id: String(app.id),
      jobId: String(app.job_id || app.jobId || app.job?.id || ""),
      jobTitle: app.job?.title || app.jobTitle || "Unknown Job",
      status: app.status?.status_name || app.status || "Pending",
      appliedAt:
        app.applied_at ||
        app.appliedAt ||
        app.created_at ||
        new Date().toISOString(),
    }));
  },
);

export const applyToJob = createAsyncThunk<
  Application,
  { jobId: string; coverLetter: string; resumeUrl: string }
>("jobSeeker/applyToJob", async ({ jobId, coverLetter, resumeUrl }) => {
  const response = await api.post("/applications", {
    jobId,
    job_id: jobId,
    coverLetter,
    cover_letter: coverLetter,
    resume_url: resumeUrl,
    resumeUrl,
  });
  const app = response.data.application || response.data;
  return {
    id: String(app.id || Date.now()),
    jobId: String(app.job_id || app.jobId || jobId),
    jobTitle: app.job?.title || app.jobTitle || "",
    status: app.status?.status_name || app.status || "Pending",
    appliedAt: app.applied_at || app.appliedAt || new Date().toISOString(),
  };
});

export const fetchCompanies = createAsyncThunk<Company[]>(
  "jobSeeker/fetchCompanies",
  async () => {
    try {
      const res = await api.get("/employers");
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.companies || res.data.data || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.map((co: any) => ({
        id: String(co.id),
        name: co.company_name || co.name || "",
        industry: co.industry || "",
        jobsCount: co.jobCount || co.jobs_count || 0,
        verified: co.verified || false,
        logo: co.logo_url || co.logo || "",
      }));
    } catch {
      return [];
    }
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
      // ── searchJobs ──────────────────────────────────────────
      .addCase(searchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchJobs.fulfilled, (state, action: PayloadAction<Job[]>) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(searchJobs.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load jobs";
      })

      // ── fetchJobs ───────────────────────────────────────────
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action: PayloadAction<Job[]>) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load jobs";
      })

      // ── fetchApplications ───────────────────────────────────
      .addCase(fetchApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchApplications.fulfilled,
        (state, action: PayloadAction<Application[]>) => {
          state.loading = false;
          state.applications = action.payload;
        },
      )
      .addCase(fetchApplications.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load applications";
      })

      // ── applyToJob ──────────────────────────────────────────
      .addCase(
        applyToJob.fulfilled,
        (state, action: PayloadAction<Application>) => {
          const exists = state.applications.some(
            (a) => a.id === action.payload.id,
          );
          if (!exists) state.applications.unshift(action.payload);
        },
      )

      // ── bookmarkJob ─────────────────────────────────────────
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

      // ── fetchBookmarks ──────────────────────────────────────
      .addCase(
        fetchBookmarks.fulfilled,
        (state, action: PayloadAction<Bookmark[]>) => {
          state.bookmarks = action.payload;
        },
      )

      // ── fetchCompanies ──────────────────────────────────────
      .addCase(
        fetchCompanies.fulfilled,
        (state, action: PayloadAction<Company[]>) => {
          state.companies = action.payload;
        },
      );
  },
});

export default jobSeekerSlice.reducer;
