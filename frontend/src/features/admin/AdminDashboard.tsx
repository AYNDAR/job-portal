import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { logout } from "../../store/authSlice";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Bell,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
} from "lucide-react";
import LogoutConfirmModal from "../../components/common/LogoutConfirmModal";
import NotificationBell from "../../components/common/NotificationBell";

const menuItems = [
  { name: "Dashboard", path: "/admin", icon: <LayoutDashboard size={18} /> },
  { name: "Users", path: "/admin/users", icon: <Users size={18} /> },
  { name: "Jobs", path: "/admin/jobs", icon: <Briefcase size={18} /> },
  {
    name: "Applications",
    path: "/admin/applications",
    icon: <FileText size={18} />,
  },
  {
    name: "Notifications",
    path: "/admin/notifications",
    icon: <Bell size={18} />,
  },
  { name: "Settings", path: "/admin/settings", icon: <Settings size={18} /> },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const initials = user?.email?.[0]?.toUpperCase() || "AD";

  const currentPage =
    menuItems.find((item) => item.path === location.pathname)?.name ||
    "Dashboard";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-16"} bg-white border-r border-gray-100 flex flex-col transition-all duration-300 overflow-y-auto sticky top-0 h-screen`}
      >
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-blue-600">Admin Panel</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                location.pathname === item.path
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              title={!sidebarOpen ? item.name : ""}
            >
              <span
                className={
                  location.pathname === item.path
                    ? "text-blue-500"
                    : "text-gray-400"
                }
              >
                {item.icon}
              </span>
              {sidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition"
          >
            <LogOut size={16} /> {sidebarOpen && "Sign out"}
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Sticky navbar – shows current page title */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-3">
            <div>
              <span className="font-bold text-base text-gray-900">
                {currentPage}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                  {initials}
                </div>
                <span className="hidden md:block text-sm text-gray-700">
                  {user?.email?.split("@")[0] || "Admin"}
                </span>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="hidden md:block text-xs text-red-500 hover:text-red-700 font-medium ml-1 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
