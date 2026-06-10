import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { logout } from "../../store/authSlice";
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Users,
  BarChart,
  Building,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
} from "lucide-react";
import LogoutConfirmModal from "../../components/common/LogoutConfirmModal";
import NotificationBell from "../../components/common/NotificationBell";

const menuItems = [
  {
    name: "Dashboard",
    path: "/employer/dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    name: "My Jobs",
    path: "/employer/dashboard/jobs",
    icon: <Briefcase size={18} />,
  },
  {
    name: "Post a Job",
    path: "/employer/dashboard/post",
    icon: <PlusCircle size={18} />,
  },
  {
    name: "Applicants",
    path: "/employer/dashboard/applicants",
    icon: <Users size={18} />,
  },
  {
    name: "Analytics",
    path: "/employer/dashboard/analytics",
    icon: <BarChart size={18} />,
  },
  {
    name: "Company Profile",
    path: "/employer/dashboard/profile",
    icon: <Building size={18} />,
  },
  {
    name: "Settings",
    path: "/employer/dashboard/settings",
    icon: <Settings size={18} />,
  },
];

const AVATAR_STORAGE_KEY = "employer_avatar";

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const storedAvatar = localStorage.getItem(AVATAR_STORAGE_KEY);
    if (storedAvatar) setAvatarUrl(storedAvatar);
    const handleAvatarUpdate = (event: CustomEvent) => {
      if (event.detail) {
        setAvatarUrl(event.detail);
      } else {
        const newAvatar = localStorage.getItem(AVATAR_STORAGE_KEY);
        if (newAvatar) setAvatarUrl(newAvatar);
      }
    };
    window.addEventListener(
      "avatarUpdated",
      handleAvatarUpdate as EventListener,
    );
    return () =>
      window.removeEventListener(
        "avatarUpdated",
        handleAvatarUpdate as EventListener,
      );
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const initials = user?.email?.[0]?.toUpperCase() || "EM";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar (collapsible) */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-16"} bg-white border-r border-gray-100 flex flex-col transition-all duration-300 overflow-y-auto sticky top-0 h-screen`}
      >
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-purple-600">
              Employer Portal
            </h1>
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
                  ? "bg-purple-50 text-purple-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              title={!sidebarOpen ? item.name : ""}
            >
              <span
                className={
                  location.pathname === item.path
                    ? "text-purple-500"
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
        {/* Sticky navbar – identical to home page navbar */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-2">
            {/* Left: Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center">
                <Briefcase size={14} className="text-white" />
              </div>
              <span className="font-bold text-base text-gray-900">
                JobPortal
              </span>
            </Link>

            {/* Center: navigation links (matching home page) */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/jobs"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                Find Jobs
              </Link>
              <Link
                to="/companies"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                Companies
              </Link>
              <Link
                to="/career-tips"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                Career Tips
              </Link>
            </div>

            {/* Right: user menu */}
            <div className="flex items-center gap-3">
              <NotificationBell />
              <div className="flex items-center gap-2">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-semibold">
                    {initials}
                  </div>
                )}
                <span className="hidden md:block text-sm text-gray-700">
                  {user?.email?.split("@")[0] || "Employer"}
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
