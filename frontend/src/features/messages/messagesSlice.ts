import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export interface Message {
  id: string;
  from: string;
  fromAvatar?: string;
  message: string;
  time: string;
  read: boolean;
  jobId?: string;
}

interface MessagesState {
  messages: Message[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: MessagesState = {
  messages: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const fetchMessages = createAsyncThunk("messages/fetch", async () => {
  const response = await api.get("/messages");
  return response.data;
});

export const markMessageRead = createAsyncThunk(
  "messages/markRead",
  async (messageId: string) => {
    await api.patch(`/messages/${messageId}/read`);
    return messageId;
  },
);

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
        state.unreadCount = action.payload.filter(
          (m: Message) => !m.read,
        ).length;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load messages";
      })
      .addCase(markMessageRead.fulfilled, (state, action) => {
        const message = state.messages.find((m) => m.id === action.payload);
        if (message && !message.read) {
          message.read = true;
          state.unreadCount--;
        }
      });
  },
});

export default messagesSlice.reducer;
