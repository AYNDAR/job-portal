import { NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { logout } from "../../store/authSlice";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  UserCheck,
  FileText,
  Bell,
  Settings,
  BarChart,
  Tag,
  Clock,
  CheckCircle,
  Shield,
  AlertTriangle,
  Activity,
  User,
  LogOut,
} from "lucide-react";

interface MenuItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  onClick?: () => void; // optional for logout
}

const menuSections: { title: string; items: MenuItem[] }[] = [
  {
    title: "Main",
    items: [
      {
        name: "Dashboard",
        path: "/admin",
        icon: <LayoutDashboard className="h-4 w-4" />,
      },
      {
        name: "Users Management",
        path: "/admin/users",
        icon: <Users className="h-4 w-4" />,
      },
      {
        name: "Employers Management",
        path: "/admin/employers",
        icon: <Briefcase className="h-4 w-4" />,
      },
      {
        name: "Job Seekers Management",
        path: "/admin/job-seekers",
        icon: <UserCheck className="h-4 w-4" />,
      },
      {
        name: "Job Posts Moderation",
        path: "/admin/jobs",
        icon: <FileText className="h-4 w-4" />,
      },
      {
        name: "Notifications",
        path: "/admin/notifications",
        icon: <Bell className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "System Management",
    items: [
      {
        name: "Reports & Analytics",
        path: "/admin/reports",
        icon: <BarChart className="h-4 w-4" />,
      },
      {
        name: "Categories Management",
        path: "/admin/categories",
        icon: <Tag className="h-4 w-4" />,
      },
      {
        name: "Employment Types",
        path: "/admin/employment-types",
        icon: <Briefcase className="h-4 w-4" />,
      },
      {
        name: "Job Status Management",
        path: "/admin/job-status",
        icon: <Clock className="h-4 w-4" />,
      },
      {
        name: "Application Status Management",
        path: "/admin/app-status",
        icon: <CheckCircle className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "Security & Control",
    items: [
      {
        name: "Suspended Accounts",
        path: "/admin/suspended",
        icon: <Shield className="h-4 w-4" />,
      },
      {
        name: "Reported Jobs",
        path: "/admin/reported-jobs",
        icon: <AlertTriangle className="h-4 w-4" />,
      },
      {
        name: "Activity Logs",
        path: "/admin/activity-logs",
        icon: <Activity className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        name: "Admin Profile",
        path: "/admin/profile",
        icon: <User className="h-4 w-4" />,
      },
      {
        name: "Settings",
        path: "/admin/settings",
        icon: <Settings className="h-4 w-4" />,
      },
      {
        name: "Change Password",
        path: "/admin/change-password",
        icon: <Shield className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "Others",
    items: [
      {
        name: "Logout",
        path: "#",
        icon: <LogOut className="h-4 w-4" />,
        onClick: () => {},
      }, // placeholder, actual handler in component
    ],
  },
];

export default function AdminSidebar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-white shadow-md flex flex-col sticky top-0 h-screen overflow-y-auto">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-blue-600">Jobie</h1>
      </div>
      <nav className="flex-1 p-4 space-y-6">
        {menuSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) =>
                item.onClick ? (
                  <button
                    key={item.name}
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </button>
                ) : (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-md transition ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-100"
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </NavLink>
                ),
              )}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-4 text-xs text-gray-400 border-t">© JobPortal</div>
    </aside>
  );
}
