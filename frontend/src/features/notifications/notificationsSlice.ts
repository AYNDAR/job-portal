import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsState {
  notifications: Notification[];
  loading: boolean;
}

const initialState: NotificationsState = {
  notifications: [],
  loading: false,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async () => {
    const response = await api.get("/notifications");
    return response.data;
  },
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    return id;
  },
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notif = state.notifications.find((n) => n.id === action.payload);
        if (notif) notif.isRead = true;
      });
  },
});

export default notificationsSlice.reducer;
