import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import profileReducer from "../features/auth/profileSlice";
import jobSeekerReducer from "../features/jobSeeker/jobSeekerSlice";
import messagesReducer from "../features/messages/messagesSlice";
import jobsReducer from "./jobsSlice";
import bookmarksReducer from "./bookmarksSlice";
import notificationsReducer from "./notificationsSlice";
import applicationReducer from "./applicationSlice";
import adminReducer from "./adminSlice";
import employerReducer from "./employerSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    jobSeeker: jobSeekerReducer,
    messages: messagesReducer,
    jobs: jobsReducer,
    bookmarks: bookmarksReducer,
    notifications: notificationsReducer,
    application: applicationReducer,
    admin: adminReducer,
    employer: employerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
