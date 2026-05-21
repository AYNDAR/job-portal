/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../services/api";

export interface SimpleJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryRange: string;
  employmentType: string;
  industry: string;
  description: string;
}

interface JobsState {
  items: SimpleJob[];
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: JobsState = {
  items: [],
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
};

interface SearchParams {
  title?: string;
  location?: string;
  industry?: string;
  type?: string;
  salary?: string;
  jobSite?: string;
  experienceLevel?: string;
  educationLevel?: string;
  genderPreference?: string;
  page: number;
  limit?: number;
}

// Define the expected response shape (can be array or object with data/pagination)
type JobsResponse =
  | SimpleJob[]
  | { data: SimpleJob[]; pagination: { page: number; pages: number } }
  | { items: SimpleJob[]; totalPages: number; currentPage: number };

export const searchJobs = createAsyncThunk<JobsResponse, SearchParams>(
  "jobs/search",
  async (params: SearchParams) => {
    const query = new URLSearchParams();
    if (params.title) query.append("title", params.title);
    if (params.location) query.append("location", params.location);
    if (params.industry) query.append("industry", params.industry);
    if (params.type) query.append("type", params.type);
    if (params.salary) query.append("salary", params.salary);
    if (params.jobSite) query.append("jobSite", params.jobSite);
    if (params.experienceLevel)
      query.append("experienceLevel", params.experienceLevel);
    if (params.educationLevel)
      query.append("educationLevel", params.educationLevel);
    if (params.genderPreference)
      query.append("genderPreference", params.genderPreference);
    query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    const res = await api.get(`/jobs/search?${query.toString()}`);
    return res.data as JobsResponse;
  },
);

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearJobs: (state) => {
      state.items = [];
      state.currentPage = 1;
      state.totalPages = 1;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        let jobsArray: SimpleJob[] = [];
        let paginationInfo: { page?: number; pages?: number } = {};

        if (Array.isArray(payload)) {
          jobsArray = payload;
          paginationInfo = { page: 1, pages: 1 };
        } else if (payload && typeof payload === "object") {
          if ("data" in payload && Array.isArray(payload.data)) {
            jobsArray = payload.data;
            if ("pagination" in payload && payload.pagination) {
              paginationInfo = payload.pagination;
            }
          } else if ("items" in payload && Array.isArray(payload.items)) {
            jobsArray = payload.items;
            if ("totalPages" in payload) {
              paginationInfo = {
                pages: payload.totalPages,
                page: payload.currentPage,
              };
            }
          }
        }

        // Normalize job fields to match SimpleJob
        state.items = jobsArray.map((job) => ({
          id: job.id,
          title: job.title,
          company: job.company || (job as any).employer?.company_name || "",
          location: job.location || (job as any).employer?.location || "",
          salaryRange: job.salaryRange || (job as any).salary_range || "",
          employmentType:
            job.employmentType || (job as any).employment_type?.type_name || "",
          industry: job.industry || (job as any).industry?.industry_name || "",
          description: job.description,
        }));

        state.totalPages = paginationInfo.pages || 1;
        state.currentPage = paginationInfo.page || 1;
      })
      .addCase(searchJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch jobs";
      });
  },
});

export const { setPage, clearJobs } = jobsSlice.actions;
export default jobsSlice.reducer;
