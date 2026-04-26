import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

interface EmployerJob {
  id: string;
  title: string;
  description: string;
  salary_range: string | null;
  created_at: string;
  status: { status_name: string };
}

interface EmployerApplication {
  id: string;
  cover_letter: string | null;
  applied_at: string;
  resume_url: string | null;
  seeker: { full_name: string; email: string; resume_url: string | null };
  status: { status_name: string };
  notes: {
    id: number;
    note_text: string;
    created_at: string;
    employer: { company_name: string };
  }[];
}

interface EmployerState {
  jobs: EmployerJob[];
  applications: EmployerApplication[];
  isLoading: boolean;
  error: string | null;
}

const initialState: EmployerState = {
  jobs: [],
  applications: [],
  isLoading: false,
  error: null,
};

export const fetchEmployerJobs = createAsyncThunk(
  "employer/fetchJobs",
  async () => {
    const res = await api.get("/employer/jobs");
    return res.data;
  },
);

export const fetchJobApplications = createAsyncThunk(
  "employer/fetchApplications",
  async (jobId: string) => {
    const res = await api.get(`/employer/jobs/${jobId}/applicants`);
    return { jobId, applications: res.data };
  },
);

export const updateApplicationStatus = createAsyncThunk(
  "employer/updateStatus",
  async ({
    applicationId,
    statusName,
  }: {
    applicationId: string;
    statusName: string;
  }) => {
    await api.patch(`/employer/applications/${applicationId}/status`, {
      statusName,
    });
    return { applicationId, statusName };
  },
);

export const addApplicationNote = createAsyncThunk(
  "employer/addNote",
  async ({
    applicationId,
    noteText,
  }: {
    applicationId: string;
    noteText: string;
  }) => {
    const res = await api.post(
      `/employer/applications/${applicationId}/notes`,
      { noteText },
    );
    return { applicationId, note: res.data };
  },
);

const employerSlice = createSlice({
  name: "employer",
  initialState,
  reducers: {
    clearEmployerError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployerJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployerJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchEmployerJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch jobs";
      })
      .addCase(fetchJobApplications.fulfilled, (state, action) => {
        state.applications = action.payload.applications;
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        const { applicationId, statusName } = action.payload;
        const app = state.applications.find((a) => a.id === applicationId);
        if (app) app.status.status_name = statusName;
      })
      .addCase(addApplicationNote.fulfilled, (state, action) => {
        const { applicationId, note } = action.payload;
        const app = state.applications.find((a) => a.id === applicationId);
        if (app) app.notes.push(note);
      });
  },
});

export const { clearEmployerError } = employerSlice.actions;
export default employerSlice.reducer;
