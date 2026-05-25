import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import JobSearch from "./features/jobs/JobSearch";
import JobDetailsPage from "./features/jobs/JobDetailsPage";
import ApplyForm from "./features/applications/ApplyForm";

import BookmarksPage from "./features/bookmarks/BookmarksPage";
import NotificationsPage from "./features/notifications/NotificationsPage";
import JobSeekerDashboard from "./features/jobSeeker/pages/Dashboard";
import StatusPage from "./features/jobSeeker/pages/Status";
import SettingsPage from "./features/jobSeeker/pages/Settings";
import SuperAdminDashboard from "./features/superAdmin/SuperAdminDashboard";
import AdminDashboard from "./features/admin/AdminDashboard";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Home from "./pages/Home"; // ✅ import the new Home component

// Employer dashboard
import EmployerLayout from "./components/employer/EmployerLayout";
import EmployerOverview from "./features/employer/EmployerOverview";
import EmployerJobsPage from "./features/employer/EmployerJobsPage";
import EmployerApplicantsPage from "./features/employer/EmployerApplicantsPage";
import PostJobForm from "./features/employer/PostJobForm";
import EmployerAnalyticsPage from "./features/employer/EmployerAnalyticsPage";
import CompanyProfilePage from "./features/employer/CompanyProfilePage";
import EmployerSettingsPage from "./features/employer/EmployerSettingsPage";
import MyApplications from "./features/applications/MyApplications";
import FindJobsPage from "./pages/FindJobsPage";
import CompaniesPage from "./pages/CompaniesPage";
import CareerTipsPage from "./pages/CareerTipsPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Home page (landing) - no Layout wrapper */}
      <Route path="/" element={<Home />} />
      <Route path="/jobs" element={<FindJobsPage />} />
      <Route path="/companies" element={<CompaniesPage />} />
      <Route path="/career-tips" element={<CareerTipsPage />} />

      {/* Admin */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Super Admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Super Admin */}
      <Route
        path="/super-admin"
        element={
          <ProtectedRoute allowedRoles={["Super Admin"]}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Employer dashboard — nested routes with sidebar */}
      <Route
        path="/employer/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Employer"]}>
            <EmployerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EmployerOverview />} />
        <Route path="jobs" element={<EmployerJobsPage />} />
        <Route path="post" element={<PostJobForm />} />
        <Route path="applicants" element={<EmployerApplicantsPage />} />
        <Route path="analytics" element={<EmployerAnalyticsPage />} />
        <Route path="profile" element={<CompanyProfilePage />} />
        <Route path="settings" element={<EmployerSettingsPage />} />
      </Route>

      {/* Main layout for protected pages and job search */}
      <Route element={<Layout />}>
        <Route path="/jobs" element={<JobSearch />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />

        <Route
          path="/apply/:id"
          element={
            <ProtectedRoute allowedRoles={["Job Seeker"]}>
              <ApplyForm />
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
              <BookmarksPage />
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
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/status"
          element={
            <ProtectedRoute allowedRoles={["Job Seeker"]}>
              <StatusPage />
            </ProtectedRoute>
          }
        />
        {/* Removed duplicate /my-applications */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["Job Seeker"]}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
