import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { AdminUser, AdminJob, AdminStats } from "./types";

interface AdminState {
  users: AdminUser[];
  jobs: AdminJob[];
  adminUsers: AdminUser[];
  stats: AdminStats | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  users: [],
  jobs: [],
  adminUsers: [],
  stats: null,
  isLoading: false,
  error: null,
};

// Thunks for regular admin operations
export const fetchAllUsers = createAsyncThunk(
  "admin/fetchAllUsers",
  async () => {
    const res = await api.get("/admin/users");
    return res.data as AdminUser[];
  },
);

export const fetchAllJobs = createAsyncThunk("admin/fetchAllJobs", async () => {
  const res = await api.get("/admin/jobs");
  return res.data as AdminJob[];
});

export const fetchAdminStats = createAsyncThunk(
  "admin/fetchStats",
  async () => {
    const res = await api.get("/admin/stats");
    return res.data as AdminStats;
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

// Thunks for Super Admin: manage admin accounts
export const fetchAdminUsers = createAsyncThunk(
  "admin/fetchAdminUsers",
  async () => {
    const res = await api.get("/admin/admins");
    return res.data as AdminUser[];
  },
);

export const createAdmin = createAsyncThunk(
  "admin/createAdmin",
  async (data: { email: string; password: string }) => {
    const res = await api.post("/admin/admins", data);
    return res.data as AdminUser;
  },
);

export const resetAdminPassword = createAsyncThunk(
  "admin/resetAdminPassword",
  async ({ id, password }: { id: string; password: string }) => {
    const res = await api.put(`/admin/admins/${id}`, { password });
    return res.data as AdminUser;
  },
);

export const deleteAdmin = createAsyncThunk(
  "admin/deleteAdmin",
  async (id: string) => {
    await api.delete(`/admin/admins/${id}`);
    return id;
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
      // fetchAllUsers
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
      // fetchAllJobs
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
      // fetchAdminStats
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        console.error("Stats fetch failed:", action.error);
      })
      // fetchAdminUsers
      .addCase(fetchAdminUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminUsers = action.payload;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch admin users";
      })
      // createAdmin
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.adminUsers.push(action.payload);
      })
      // resetAdminPassword
      .addCase(resetAdminPassword.fulfilled, (state, action) => {
        const index = state.adminUsers.findIndex(
          (u) => u.id === action.payload.id,
        );
        if (index !== -1) state.adminUsers[index] = action.payload;
      })
      // deleteAdmin
      .addCase(deleteAdmin.fulfilled, (state, action) => {
        state.adminUsers = state.adminUsers.filter(
          (u) => u.id !== action.payload,
        );
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
