import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

interface Notification {
  id: number;
  message: string;
  trigger_type: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationsState {
  items: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async () => {
    const res = await api.get("/notifications");
    return res.data;
  },
);

export const markAsRead = createAsyncThunk(
  "notifications/markRead",
  async (id: number) => {
    await api.patch(`/notifications/${id}/read`);
    return id;
  },
);

export const markAllAsRead = createAsyncThunk(
  "notifications/markAllRead",
  async () => {
    await api.patch("/notifications/read-all");
    return;
  },
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.unreadCount = action.payload.filter(
          (n: Notification) => !n.is_read,
        ).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch notifications";
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.items.find((n) => n.id === action.payload);
        if (notification && !notification.is_read) {
          notification.is_read = true;
          state.unreadCount--;
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach((n) => (n.is_read = true));
        state.unreadCount = 0;
      });
  },
});

export default notificationsSlice.reducer;
