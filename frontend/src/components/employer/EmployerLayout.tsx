import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  UsersRound,
  BarChart,
  Building,
  Settings,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    path: "/employer/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    name: "My Jobs",
    path: "/employer/dashboard/jobs",
    icon: <Briefcase className="h-4 w-4" />,
  },
  {
    name: "Post a Job",
    path: "/employer/dashboard/post",
    icon: <PlusCircle className="h-4 w-4" />,
  },
  {
    name: "Applicants",
    path: "/employer/dashboard/applicants",
    icon: <UsersRound className="h-4 w-4" />,
  },
  {
    name: "Analytics",
    path: "/employer/dashboard/analytics",
    icon: <BarChart className="h-4 w-4" />,
  },
  {
    name: "Company Profile",
    path: "/employer/dashboard/profile",
    icon: <Building className="h-4 w-4" />,
  },
  {
    name: "Settings",
    path: "/employer/dashboard/settings",
    icon: <Settings className="h-4 w-4" />,
  },
];

export default function EmployerLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold text-blue-600">JobPortal</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
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
          ))}
        </nav>
        <div className="p-4 text-xs text-gray-400 border-t">© JobPortal</div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
