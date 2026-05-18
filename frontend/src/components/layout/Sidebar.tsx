import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  Building2,
  BarChart3,
  Settings,
} from "lucide-react";

const Sidebar = () => {
  const menuGroups = [
    {
      label: "MAIN",
      items: [
        {
          name: "Dashboard",
          path: "/employer/dashboard",
          icon: LayoutDashboard,
        },
        { name: "Job Posts", path: "/employer/jobs", icon: Briefcase },
        { name: "Applicants", path: "/employer/applicants", icon: Users },
        { name: "Interviews", path: "/employer/interviews", icon: Calendar },
      ],
    },
    {
      label: "ACCOUNT",
      items: [
        { name: "Company Profile", path: "/employer/profile", icon: Building2 },
        { name: "Analytics", path: "/employer/analytics", icon: BarChart3 },
        { name: "Settings", path: "/employer/settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#1a1a1a] border-r border-gray-800 flex flex-col h-screen sticky top-0 z-50">
      <div className="p-8">
        <h1 className="text-2xl font-bold bg-linear-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
          JobPortal
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-8">
        {menuGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-bold text-gray-500 mb-4 px-4 tracking-[0.2em]">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600/10 text-blue-500 shadow-[inset_4px_0_0_0_#3b82f6]"
                        : "text-gray-400 hover:bg-[#252525] hover:text-white"
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 mr-3 stroke-[1.5px]" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
