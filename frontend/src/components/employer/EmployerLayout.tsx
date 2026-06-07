import { useState, useRef, useEffect } from "react";
import { Outlet, useLocation, useNavigate, NavLink } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../store/authSlice";
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Users,
  BarChart2,
  Building2,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Home,
} from "lucide-react";

const NAV = [
  {
    path: "/employer/dashboard",
    label: "Overview",
    icon: <LayoutDashboard size={17} />,
    end: true,
  },
  {
    path: "/employer/dashboard/jobs",
    label: "My Jobs",
    icon: <Briefcase size={17} />,
    end: false,
  },
  {
    path: "/employer/dashboard/post",
    label: "Post a Job",
    icon: <PlusCircle size={17} />,
    end: false,
  },
  {
    path: "/employer/dashboard/applicants",
    label: "Applicants",
    icon: <Users size={17} />,
    end: false,
  },
  {
    path: "/employer/dashboard/analytics",
    label: "Analytics",
    icon: <BarChart2 size={17} />,
    end: false,
  },
  {
    path: "/employer/dashboard/profile",
    label: "Company Profile",
    icon: <Building2 size={17} />,
    end: false,
  },
  {
    path: "/employer/dashboard/settings",
    label: "Settings",
    icon: <Settings size={17} />,
    end: false,
  },
];

export default function EmployerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const [profDrop, setProfDrop] = useState(false);
  const [mobile, setMobile] = useState(false);
  const profRef = useRef<HTMLDivElement>(null);

  const userRaw = localStorage.getItem("user");
  const u = userRaw ? JSON.parse(userRaw) : user;
  const initials = u?.email?.slice(0, 2).toUpperCase() ?? "EM";
  const name = u?.email?.split("@")[0] ?? "Employer";

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (profRef.current && !profRef.current.contains(e.target as Node))
        setProfDrop(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to sign out?")) return;
    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const pageTitle =
    NAV.find((n) =>
      n.end
        ? location.pathname === n.path
        : location.pathname.startsWith(n.path),
    )?.label ?? "Dashboard";

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* ── Top Navbar ── */}
      <nav className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 shrink-0 z-40">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobile(!mobile)}
            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            {mobile ? <X size={18} /> : <Menu size={18} />}
          </button>
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase size={13} className="text-white" />
            </div>
            <span className="font-bold text-base text-gray-900 hidden sm:block">
              JobPortal
            </span>
          </NavLink>
          <span className="hidden md:block text-gray-300">·</span>
          <span className="hidden md:block text-sm font-semibold text-gray-700">
            {pageTitle}
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <NavLink
            to="/"
            className="hidden md:flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            <Home size={13} /> Home
          </NavLink>
          <button
            onClick={() => navigate("/employer/dashboard")}
            className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
          >
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>
          <div className="relative" ref={profRef}>
            <button
              onClick={() => setProfDrop(!profDrop)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 bg-white transition"
            >
              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-800 max-w-25 truncate">
                {name}
              </span>
              <ChevronDown
                size={13}
                className={`text-gray-400 transition-transform ${profDrop ? "rotate-180" : ""}`}
              />
            </button>
            {profDrop && (
              <div className="absolute top-full right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100 mb-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{u?.email}</p>
                  <span className="mt-1 inline-block text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                    Employer
                  </span>
                </div>
                {NAV.slice(0, 4).map((n) => (
                  <NavLink
                    key={n.path}
                    to={n.path}
                    onClick={() => setProfDrop(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    <span className="text-gray-400">{n.icon}</span> {n.label}
                  </NavLink>
                ))}
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${mobile ? "flex" : "hidden"} md:flex w-56 bg-white border-r border-gray-100 flex-col shrink-0 overflow-y-auto`}
        >
          {/* User card */}
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {name}
                </p>
                <p className="text-xs text-gray-400 truncate">Employer</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-3 px-3">
            <ul className="space-y-0.5">
              {NAV.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.end}
                    onClick={() => setMobile(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={
                            isActive ? "text-blue-500" : "text-gray-400"
                          }
                        >
                          {item.icon}
                        </span>
                        <span className="flex-1">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sign out */}
          <div className="border-t border-gray-100 px-3 py-3 shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition font-medium"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </aside>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
