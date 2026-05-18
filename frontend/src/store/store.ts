import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import jobsReducer from "./jobsSlice";
import bookmarksReducer from "./bookmarksSlice";
import notificationsReducer from "./notificationsSlice";
import adminReducer from "../features/admin/adminSlice";
// employerReducer removed – employer dashboard uses direct API calls
// Ensure applicationsSlice exists, otherwise comment out
import applicationsReducer from "../features/applications/applicationsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobsReducer,
    bookmarks: bookmarksReducer,
    notifications: notificationsReducer,
    admin: adminReducer,
    applications: applicationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
