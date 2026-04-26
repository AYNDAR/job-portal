import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

interface AdminUser {
  id: string;
  email: string;
  user_type: { type_name: string };
  created_at: string;
}

interface AdminJob {
  id: string;
  title: string;
  employer: { company_name: string };
  status: { status_name: string };
  created_at: string;
}

interface AdminStats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
}

interface AdminState {
  users: AdminUser[];
  jobs: AdminJob[];
  stats: AdminStats | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  users: [],
  jobs: [],
  stats: null,
  isLoading: false,
  error: null,
};

export const fetchAllUsers = createAsyncThunk("admin/fetchUsers", async () => {
  const res = await api.get("/admin/users");
  return res.data;
});

export const fetchAllJobs = createAsyncThunk("admin/fetchJobs", async () => {
  const res = await api.get("/admin/jobs");
  return res.data;
});

export const fetchAdminStats = createAsyncThunk(
  "admin/fetchStats",
  async () => {
    const res = await api.get("/admin/stats");
    return res.data;
  },
);

export const suspendUser = createAsyncThunk(
  "admin/suspendUser",
  async (userId: string, { dispatch }) => {
    await api.patch(`/admin/users/${userId}/suspend`);
    dispatch(fetchAllUsers());
    return userId;
  },
);

export const closeJob = createAsyncThunk(
  "admin/closeJob",
  async (jobId: string, { dispatch }) => {
    await api.patch(`/admin/jobs/${jobId}/close`);
    dispatch(fetchAllJobs());
    return jobId;
  },
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch users";
      })
      .addCase(fetchAllJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchAllJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch jobs";
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        console.error("Stats fetch failed:", action.error);
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
