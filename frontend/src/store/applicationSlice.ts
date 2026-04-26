import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

interface Application {
  id: string;
  job: {
    id: string;
    title: string;
    employer: { company_name: string };
    employment_type: { type_name: string };
    salary_range: string;
  };
  status: { status_name: string };
  cover_letter: string | null;
  applied_at: string;
}

interface ApplicationsState {
  items: Application[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ApplicationsState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchMyApplications = createAsyncThunk(
  "applications/fetch",
  async () => {
    const res = await api.get("/applications/my-applications");
    return res.data;
  },
);

const applicationsSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {
    clearApplicationsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyApplications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchMyApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch applications";
      });
  },
});

export const { clearApplicationsError } = applicationsSlice.actions;
export default applicationsSlice.reducer;
