import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";

import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import JobSearch from "./pages/JobSearch";
import JobDetails from "./pages/JobDetails";

import Apply from "./pages/ApplyForm";
import Bookmarks from "./pages/Bookmarks";
import Notifications from "./pages/NotificationsPage";
import MyApplications from "./pages/MyApplications";
import JobSeekerDashboard from "./features/jobSeeker/pages/Dashboard";
import SuperAdminDashboard from "./features/superAdmin/SuperAdminDashboard";
import EmployerDashboard from "./features/employer/EmployerDashboard";
import AdminDashboard from "./features/admin/AdminDashboard";
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin routes – no outer Layout */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Super Admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Super Admin (if separate) */}
          <Route
            path="/super-admin"
            element={
              <ProtectedRoute allowedRoles={["Super Admin"]}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Layout‑protected routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<JobSearch />} />
            <Route path="/jobs" element={<JobSearch />} />
            <Route path="/jobs/:id" element={<JobDetails />} />

            <Route
              path="/apply/:id"
              element={
                <ProtectedRoute allowedRoles={["Job Seeker"]}>
                  <Apply />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Job Seeker"]}>
                  <JobSeekerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookmarks"
              element={
                <ProtectedRoute allowedRoles={["Job Seeker"]}>
                  <Bookmarks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-applications"
              element={
                <ProtectedRoute allowedRoles={["Job Seeker"]}>
                  <MyApplications />
                </ProtectedRoute>
              }
            />

            <Route
              path="/employer/dashboard/*"
              element={
                <ProtectedRoute allowedRoles={["Employer"]}>
                  <EmployerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
