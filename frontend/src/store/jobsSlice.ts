import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

export interface Job {
  id: string;
  title: string;
  description: string;
  salary_range: string;
  created_at: string;
  employer: {
    company_name: string;
    logo_url: string | null;
    location: string;
    website: string | null;
  };
  industry: { industry_name: string };
  employment_type: { type_name: string };
}

interface JobsState {
  items: Job[];
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
  page: number;
}

export const searchJobs = createAsyncThunk(
  "jobs/search",
  async (params: SearchParams) => {
    const query = new URLSearchParams();
    if (params.title) query.append("title", params.title);
    if (params.location) query.append("location", params.location);
    if (params.industry) query.append("industry", params.industry);
    if (params.type) query.append("type", params.type);
    if (params.salary) query.append("salary", params.salary);
    query.append("page", params.page.toString());
    const res = await api.get(`/jobs/search?${query.toString()}`);
    return res.data;
  },
);

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setPage: (state, action) => {
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
        state.items = action.payload.data;
        state.totalPages = action.payload.pagination.pages;
        state.currentPage = action.payload.pagination.page;
      })
      .addCase(searchJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch jobs";
      });
  },
});

export const { setPage, clearJobs } = jobsSlice.actions;
export default jobsSlice.reducer;
