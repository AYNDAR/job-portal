import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";

// Layout
import Layout from "./components/layout/Layout";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import JobSearch from "./pages/JobSearch";
import JobDetails from "./pages/JobDetails";
import Apply from "./pages/ApplyForm";
import Bookmarks from "./pages/Bookmarks";
import Notifications from "./pages/NotificationsPage";
import EmployerDashboard from "./pages/EmployerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MyApplications from "./pages/MyApplications";

// Common Components
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes with Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<JobSearch />} />
            <Route path="/jobs/:id" element={<JobDetails />} />

            {/* Job Seeker only */}
            <Route
              path="/apply/:id"
              element={
                <ProtectedRoute allowedRoles={["Job Seeker"]}>
                  <Apply />
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

            {/* Employer only */}
            <Route
              path="/employer/*"
              element={
                <ProtectedRoute allowedRoles={["Employer"]}>
                  <EmployerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin only */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Super Admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Authenticated users (any role) */}
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
