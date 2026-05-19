// features/jobSeeker/jobSeekerSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../services/api"; // adjust if your api service is elsewhere
import { Job, Bookmark, Application, JobFilters } from "./types";

interface ApplyPayload {
  jobId: string;
  coverLetter: string;
  resumeUrl: string;
}

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

// Async thunks
export const fetchJobs = createAsyncThunk<Job[], JobFilters>(
  "jobSeeker/fetchJobs",
  async (filters) => {
    const response = await api.get("/jobs", { params: filters });
    return response.data;
  },
);

export const searchJobs = createAsyncThunk<Job[], JobFilters>(
  "jobSeeker/searchJobs",
  async (params) => {
    const response = await api.get("/jobs/search", { params });
    return response.data;
  },
);

export const applyToJob = createAsyncThunk<Application, ApplyPayload>(
  "jobSeeker/applyToJob",
  async ({ jobId, coverLetter, resumeUrl }) => {
    const response = await api.post("/applications", {
      jobId,
      coverLetter,
      resumeUrl,
    });
    return response.data;
  },
);

export const bookmarkJob = createAsyncThunk<{ jobId: string }, string>(
  "jobSeeker/bookmarkJob",
  async (jobId) => {
    const response = await api.post("/bookmarks", { jobId });
    return response.data;
  },
);

export const fetchBookmarks = createAsyncThunk<Bookmark[]>(
  "jobSeeker/fetchBookmarks",
  async () => {
    const response = await api.get("/bookmarks");
    return response.data;
  },
);

export const fetchApplications = createAsyncThunk<Application[]>(
  "jobSeeker/fetchApplications",
  async () => {
    const response = await api.get("/applications/seeker");
    return response.data;
  },
);

const jobSeekerSlice = createSlice({
  name: "jobSeeker",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action: PayloadAction<Job[]>) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch jobs";
      })
      .addCase(searchJobs.fulfilled, (state, action: PayloadAction<Job[]>) => {
        state.jobs = action.payload;
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
