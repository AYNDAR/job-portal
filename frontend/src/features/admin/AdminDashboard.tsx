import { useState } from "react";
import { NavLink, Routes, Route } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { logout } from "../../store/authSlice";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  AlertTriangle,
  Shield,
  Tag,
  Bell,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
} from "lucide-react";

// Import all page components (ensure these files exist)
import DashboardHome from "./pages/DashboardHome";
import UsersManagement from "./pages/UsersManagement";
import JobsManagement from "./pages/JobsManagement";
import ApplicationsManagement from "./pages/ApplicationsManagement";
import ReportsManagement from "./pages/ReportsManagement";
import SuspendedAccounts from "./pages/SuspendedAccounts";
import CategoriesManagement from "./pages/CategoriesManagement";
import NotificationsManagement from "./pages/NotificationsManagement";
import AdminSettings from "./pages/AdminSettings";

// Menu items with correct paths (relative to /admin)
const menuSections = [
  {
    title: "MAIN",
    items: [
      {
        name: "Dashboard",
        path: "/admin",
        icon: <LayoutDashboard className="h-5 w-5" />,
        end: true,
      },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      {
        name: "Users",
        path: "/admin/users",
        icon: <Users className="h-5 w-5" />,
        end: false,
      },
      {
        name: "Jobs",
        path: "/admin/jobs",
        icon: <Briefcase className="h-5 w-5" />,
        end: false,
      },
      {
        name: "Applications",
        path: "/admin/applications",
        icon: <FileText className="h-5 w-5" />,
        end: false,
      },
    ],
  },
  {
    title: "MODERATION",
    items: [
      {
        name: "Reports",
        path: "/admin/reports",
        icon: <AlertTriangle className="h-5 w-5" />,
        end: false,
      },
      {
        name: "Suspended",
        path: "/admin/suspended",
        icon: <Shield className="h-5 w-5" />,
        end: false,
      },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      {
        name: "Categories",
        path: "/admin/categories",
        icon: <Tag className="h-5 w-5" />,
        end: false,
      },
      {
        name: "Notifications",
        path: "/admin/notifications",
        icon: <Bell className="h-5 w-5" />,
        end: false,
      },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      {
        name: "Settings",
        path: "/admin/settings",
        icon: <Settings className="h-5 w-5" />,
        end: false,
      },
      {
        name: "Logout",
        path: "#",
        icon: <LogOut className="h-5 w-5" />,
        action: true,
        end: false,
      },
    ],
  },
];

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sidebarWidth = sidebarOpen ? "w-64" : "w-16";

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside
        className={`${sidebarWidth} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-y-auto`}
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-blue-600">Jobie Admin</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-6">
          {menuSections.map((section) => (
            <div key={section.title}>
              {sidebarOpen && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) =>
                  item.action ? (
                    <button
                      key={item.name}
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-gray-700 hover:bg-gray-100"
                      title={!sidebarOpen ? item.name : ""}
                    >
                      {item.icon}
                      {sidebarOpen && <span>{item.name}</span>}
                    </button>
                  ) : (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      end={item.end}
                      className={({ isActive }) =>
                        `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700 hover:bg-gray-100"
                        }`
                      }
                      title={!sidebarOpen ? item.name : ""}
                    >
                      {item.icon}
                      {sidebarOpen && <span>{item.name}</span>}
                    </NavLink>
                  ),
                )}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-4 text-xs text-gray-500 border-t border-gray-200 text-center">
          {sidebarOpen ? "© JobPortal" : "©"}
        </div>
      </aside>

      {/* Main Content – all routes are defined here */}
      <main className="flex-1 overflow-y-auto p-6">
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="jobs" element={<JobsManagement />} />
          <Route path="applications" element={<ApplicationsManagement />} />
          <Route path="reports" element={<ReportsManagement />} />
          <Route path="suspended" element={<SuspendedAccounts />} />
          <Route path="categories" element={<CategoriesManagement />} />
          <Route path="notifications" element={<NotificationsManagement />} />
          <Route path="settings" element={<AdminSettings />} />
        </Routes>
      </main>
    </div>
  );
}
