import { configureStore } from "@reduxjs/toolkit";
import jobSeekerReducer from "../features/jobSeeker/jobSeekerslice";
// import notificationsReducer from '../features/notifications/notificationsSlice'; // not ready yet

export const store = configureStore({
  reducer: {
    jobSeeker: jobSeekerReducer,
    // notifications: notificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
