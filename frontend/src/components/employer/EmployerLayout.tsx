import { Outlet, useLocation, useNavigate } from "react-router-dom";
import EmployerSidebar from "../layout/EmployerSidebar";
import { Bell, Search } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/employer/dashboard": "Dashboard",
  "/employer/dashboard/jobs": "My Jobs",
  "/employer/dashboard/post": "Post a Job",
  "/employer/dashboard/applicants": "Applicants",
  "/employer/dashboard/profile": "Company Profile",
  "/employer/dashboard/analytics": "Analytics",
  "/employer/dashboard/settings": "Settings",
};

export default function EmployerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const title = pageTitles[location.pathname] ?? "Dashboard";
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "EM";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <EmployerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="text-base font-semibold text-gray-800">{title}</h1>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:flex items-center">
              <Search size={14} className="absolute left-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 w-44 transition"
              />
            </div>
            <button
              onClick={() => navigate("/notifications")}
              className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <button
              onClick={() => navigate("/employer/dashboard/post")}
              className="hidden md:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-1.5 rounded-lg transition shadow-sm"
            >
              + Post a Job
            </button>
            <div className="flex items-center gap-2 ml-1">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                {initials}
              </div>
              <span className="hidden md:block text-sm text-gray-700 font-medium truncate max-w-[120px]">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="hidden md:block text-xs text-red-500 hover:text-red-700 font-medium ml-1 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
