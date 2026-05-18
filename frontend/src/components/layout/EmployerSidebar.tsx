import { NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../store/authSlice";
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Users,
  Building2,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";

const navSections = [
  {
    title: "Main",
    items: [
      {
        label: "Dashboard",
        path: "/employer/dashboard",
        icon: <LayoutDashboard size={16} />,
        end: true,
      },
      {
        label: "My Jobs",
        path: "/employer/dashboard/jobs",
        icon: <Briefcase size={16} />,
      },
      {
        label: "Post a Job",
        path: "/employer/dashboard/post",
        icon: <PlusCircle size={16} />,
      },
      {
        label: "Applicants",
        path: "/employer/dashboard/applicants",
        icon: <Users size={16} />,
      },
    ],
  },
  {
    title: "Company",
    items: [
      {
        label: "Company Profile",
        path: "/employer/dashboard/profile",
        icon: <Building2 size={16} />,
      },
      {
        label: "Analytics",
        path: "/employer/dashboard/analytics",
        icon: <BarChart3 size={16} />,
      },
      {
        label: "Notifications",
        path: "/notifications",
        icon: <Bell size={16} />,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        label: "Settings",
        path: "/employer/dashboard/settings",
        icon: <Settings size={16} />,
      },
    ],
  },
];

export default function EmployerSidebar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const companyName = user?.email?.split("@")[0] ?? "Employer";
  const initials = companyName.slice(0, 2).toUpperCase();

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen overflow-y-auto">
      <div className="px-5 py-5 border-b border-gray-100">
        <span className="text-xl font-bold text-blue-600 tracking-tight">
          JobPortal
        </span>
        <span className="ml-1 text-xs text-gray-400 font-medium">Employer</span>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={"end" in item ? item.end : false}
                    className={({ isActive }) =>
                      `group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={
                            isActive
                              ? "text-blue-500"
                              : "text-gray-400 group-hover:text-gray-600"
                          }
                        >
                          {item.icon}
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {isActive && (
                          <ChevronRight size={12} className="text-blue-400" />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-100 px-3 py-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {companyName}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => {
            dispatch(logout());
            navigate("/login");
          }}
          className="mt-1 w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
        >
          <LogOut size={15} /> Logout
        </button>
      </div>
    </aside>
  );
}
