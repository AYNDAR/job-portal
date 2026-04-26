import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { BookmarkedJob } from "./types";

interface BookmarksState {
  items: BookmarkedJob[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BookmarksState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchBookmarks = createAsyncThunk("bookmarks/fetch", async () => {
  const res = await api.get("/bookmarks");
  return res.data as BookmarkedJob[];
});

export const addBookmark = createAsyncThunk(
  "bookmarks/add",
  async (jobId: string) => {
    const res = await api.post("/bookmarks", { jobId });
    return res.data as BookmarkedJob;
  },
);

export const removeBookmark = createAsyncThunk(
  "bookmarks/remove",
  async (jobId: string) => {
    await api.delete(`/bookmarks/${jobId}`);
    return jobId;
  },
);

const bookmarksSlice = createSlice({
  name: "bookmarks",
  initialState,
  reducers: {
    clearBookmarksError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookmarks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookmarks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchBookmarks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch bookmarks";
      })
      .addCase(addBookmark.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(removeBookmark.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.job.id !== action.payload,
        );
      });
  },
});

export const { clearBookmarksError } = bookmarksSlice.actions;
export default bookmarksSlice.reducer;
