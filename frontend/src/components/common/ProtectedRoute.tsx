import { Navigate, useLocation } from "react-router-dom";

interface Props {
  children: JSX.Element;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const location = useLocation();

  // Not logged in → go to login, remember where they were trying to go
  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  // Logged in but wrong role → send to their correct dashboard, not "/"
  if (allowedRoles && !allowedRoles.includes(user.userType)) {
    if (user.userType === "Job Seeker") {
      return <Navigate to="/dashboard" replace />;
    }
    if (user.userType === "Employer") {
      return <Navigate to="/employer/dashboard" replace />;
    }
    if (user.userType === "Admin" || user.userType === "Super Admin") {
      return <Navigate to="/admin" replace />;
    }
    // Fallback
    return <Navigate to="/" replace />;
  }

  return children;
}
