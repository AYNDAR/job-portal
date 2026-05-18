import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { logout } from "../../store/authSlice";
import NotificationBell from "../common/NotificationBell";

export default function Header() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          JobPortal
        </Link>
        <nav className="flex gap-6 items-center">
          <Link to="/jobs" className="text-gray-700 hover:text-blue-600">
            Find Jobs
          </Link>
          {user && user.userType === "Employer" && (
            <Link
              to="/employer/dashboard"
              className="text-gray-700 hover:text-blue-600"
            >
              Dashboard
            </Link>
          )}
          {user && user.userType === "Job Seeker" && (
            <Link to="/bookmarks" className="text-gray-700 hover:text-blue-600">
              Bookmarks
            </Link>
          )}
          {user && user.userType === "Job Seeker" && (
            <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
              Dashboard
            </Link>
          )}
          {user && user.userType === "Admin" && (
            <Link to="/admin" className="text-gray-700 hover:text-blue-600">
              Admin
            </Link>
          )}
          {user && user.userType === "Super Admin" && (
            <Link
              to="/super-admin"
              className="text-gray-700 hover:text-blue-600"
            >
              Super Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Link to="/login" className="text-gray-700 hover:text-blue-600">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <NotificationBell />
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={() => dispatch(logout())}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
