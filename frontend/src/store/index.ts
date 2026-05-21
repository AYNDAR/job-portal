import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import profileReducer from "../features/auth/profileSlice";
import jobSeekerReducer from "../features/jobSeeker/jobSeekerSlice";
import messagesReducer from "../features/messages/messagesSlice";
import jobsReducer from "../store/jobsSlice";
import bookmarksReducer from "../store/bookmarksSlice";
import notificationsReducer from "../store/notificationsSlice";
import applicationReducer from "../store/applicationSlice";
import adminReducer from "../store/adminSlice";
import employerReducer from "../store/employerSlice";

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
