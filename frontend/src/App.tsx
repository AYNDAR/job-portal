import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import JobDetailsPage from "./features/jobs/JobDetailsPage";
import ApplyForm from "./features/applications/ApplyForm";
import BookmarksPage from "./features/bookmarks/BookmarksPage";
import NotificationsPage from "./features/notifications/NotificationsPage";
import JobSeekerDashboard from "./features/jobSeeker/pages/Dashboard";
import StatusPage from "./features/jobSeeker/pages/Status";
import SettingsPage from "./features/jobSeeker/pages/Settings";
import SuperAdminDashboard from "./features/superAdmin/SuperAdminDashboard";
import SuperAdminDashboardHome from "./features/superAdmin/components/DashboardHome";
import SystemOverview from "./features/superAdmin/components/SystemSettings";
import AnalyticsDashboard from "./features/superAdmin/components/Analytics";
import AdminsManagement from "./features/superAdmin/components/AdminsManagement";
import UsersManagement from "./features/superAdmin/components/UsersManagement";
import JobsManagement from "./features/superAdmin/components/JobsManagement";
import ApplicationsManagement from "./features/superAdmin/components/ApplicationsManagement";

import AdminDashboard from "./features/admin/AdminDashboard";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Home from "./pages/Home";

// Employer
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
      {/* Public auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Public pages — own navbar */}
      <Route path="/" element={<Home />} />
      <Route path="/jobs" element={<FindJobsPage />} />
      <Route path="/companies" element={<CompaniesPage />} />
      <Route path="/career-tips" element={<CareerTipsPage />} />

      {/* Job Detail — outside Layout */}
      <Route path="/jobs/:id" element={<JobDetailsPage />} />

      {/* Job Seeker Dashboard — own navbar */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Job Seeker"]}>
            <JobSeekerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Super Admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Super Admin Dashboard — with nested routes */}
      <Route
        path="/super-admin/*"
        element={
          <ProtectedRoute allowedRoles={["Super Admin"]}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<SuperAdminDashboardHome />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="jobs" element={<JobsManagement />} />
        <Route path="applications" element={<ApplicationsManagement />} />
        <Route path="system" element={<SystemOverview />} />
        <Route path="admins" element={<AdminsManagement />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
      </Route>

      {/* Employer Dashboard */}
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

      {/* Layout wrapper — only for pages that need global Header/Footer */}
      <Route element={<Layout />}>
        <Route
          path="/apply/:id"
          element={
            <ProtectedRoute allowedRoles={["Job Seeker"]}>
              <ApplyForm />
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
