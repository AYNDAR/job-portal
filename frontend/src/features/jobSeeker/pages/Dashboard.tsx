/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  FileText,
  Bell,
  Settings,
  LogOut,
  Briefcase,
  Calendar,
  TrendingUp,
  Clock,
  Heart,
} from "lucide-react";
import { RootState, AppDispatch } from "../../../store";
import {
  fetchJobs,
  fetchBookmarks,
  fetchApplications,
} from "../jobSeekerSlice";
import api from "../../../services/api";
import LogoutConfirmModal from "../../../components/common/LogoutConfirmModal";
import NotificationBell from "../../../components/common/NotificationBell";
import Profile from "./Profile";
import ApplicationsPage from "./ApplicationsPage";
import SavedJobs from "./SavedJobs";
import Notifications from "./Notifications";
import SettingsPage from "./Settings";

// ---------- Constants ----------
const NAV = [
  { id: "overview", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { id: "profile", label: "My Profile", icon: <User size={18} /> },
  { id: "applications", label: "Applications", icon: <FileText size={18} /> },
  { id: "saved", label: "Saved Jobs", icon: <Heart size={18} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
  { id: "settings", label: "Settings", icon: <Settings size={18} /> },
];

// ---------- Main Component ----------
export default function JobSeekerDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { jobs, bookmarks, applications } = useSelector(
    (s: RootState) =>
      s.jobSeeker || { jobs: [], bookmarks: [], applications: [] },
  );
  const { items: notifications } = useSelector(
    (s: RootState) => s.notifications || { items: [] },
  );
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const [page, setPage] = useState<string>("overview");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profileSkills, setProfileSkills] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Load profile skills & avatar – FIXED: use avatarUrl (camelCase)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/jobseeker/profile");
        setProfileSkills(res.data.skills || []);
        setAvatarUrl(res.data.avatarUrl || null); // ✅ fixed field name
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (jobs.length === 0) return;
    if (profileSkills.length > 0) {
      const skillsLower = profileSkills.map((s) => s.toLowerCase());
      const matched = jobs.filter((job) => {
        const title = (job.title || "").toLowerCase();
        const desc = (job.description || "").toLowerCase();
        return skillsLower.some(
          (skill) => title.includes(skill) || desc.includes(skill),
        );
      });
      setRecommendedJobs(matched.slice(0, 4));
    } else {
      setRecommendedJobs(jobs.slice(0, 4));
    }
  }, [jobs, profileSkills]);

  useEffect(() => {
    const appActivities = applications.map((app) => ({
      id: `app-${app.id}`,
      type: "application",
      title: `Applied for ${app.jobTitle || "a job"}`,
      timestamp: app.appliedAt,
    }));
    const notifActivities = notifications.slice(0, 5).map((notif) => ({
      id: `notif-${notif.id}`,
      type: "notification",
      title: notif.message,
      timestamp: notif.created_at,
    }));
    const combined = [...appActivities, ...notifActivities]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 5);
    setRecentActivities(combined);
  }, [applications, notifications]);

  useEffect(() => {
    dispatch(fetchJobs({}));
    dispatch(fetchBookmarks());
    dispatch(fetchApplications());
  }, [dispatch]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const initials = user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - full height */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col shrink-0 h-full overflow-y-auto">
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="relative cursor-pointer"
              onClick={() => setPage("profile")}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">
                  {initials}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {user?.email?.split("@")[0] || "Profile"}
              </p>
              <p className="text-xs text-gray-400 truncate">Job Seeker</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-3 px-3">
          <ul className="space-y-0.5">
            {NAV.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setPage(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                    page === item.id
                      ? "bg-purple-50 text-purple-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span
                    className={
                      page === item.id ? "text-purple-500" : "text-gray-400"
                    }
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.id === "applications" && applications.length > 0 && (
                    <span className="text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded-full">
                      {applications.length}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-gray-100 px-3 py-3 shrink-0">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition font-medium"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* Right side */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-2">
            <div className="flex items-center gap-1">
              <Link
                to="/jobs"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                Find Jobs
              </Link>
              <Link
                to="/companies"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                Companies
              </Link>
              <Link
                to="/career-tips"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                Career Tips
              </Link>
            </div>
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
                  {user?.email?.split("@")[0] || "User"}
                </span>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="hidden md:block text-xs text-red-500 hover:text-red-700 font-medium ml-1"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            {page === "overview" && (
              <div className="space-y-6 max-w-6xl mx-auto">
                {/* Dashboard content – same as before */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Dashboard
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Here's your job search activity
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      title: "Applied Jobs",
                      value: applications.length,
                      icon: <Briefcase size={20} />,
                      color: "blue",
                    },
                    {
                      title: "Pending Applications",
                      value: applications.filter((a) => a.status === "Pending")
                        .length,
                      icon: <Clock size={20} />,
                      color: "yellow",
                    },
                    {
                      title: "Interview Invitations",
                      value: applications.filter(
                        (a) => a.status === "Interview",
                      ).length,
                      icon: <Calendar size={20} />,
                      color: "green",
                    },
                    {
                      title: "Bookmarked Jobs",
                      value: bookmarks.length,
                      icon: <Heart size={20} />,
                      color: "purple",
                    },
                  ].map((card) => (
                    <div
                      key={card.title}
                      className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 border-${card.color}-500`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-500">{card.title}</p>
                          <p className="text-2xl font-bold text-gray-800">
                            {card.value}
                          </p>
                        </div>
                        <div
                          className={`p-2 rounded-lg bg-${card.color}-50 text-${card.color}-500`}
                        >
                          {card.icon}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <TrendingUp size={16} /> Recent Activities
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {recentActivities.length === 0 ? (
                      <div className="px-5 py-8 text-center text-gray-400 text-sm">
                        No recent activities
                      </div>
                    ) : (
                      recentActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50"
                        >
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            {activity.type === "application" ? (
                              <FileText size={14} className="text-blue-500" />
                            ) : activity.type === "notification" ? (
                              <Bell size={14} className="text-purple-500" />
                            ) : (
                              <TrendingUp
                                size={14}
                                className="text-green-500"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-800">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                {recommendedJobs.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Recommended for You
                      </h3>
                      <Link to="/jobs" className="text-xs text-purple-600">
                        View all →
                      </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {recommendedJobs.map((job) => (
                        <div
                          key={job.id}
                          className="flex items-center justify-between px-5 py-3 hover:bg-gray-50"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {job.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {job.company || job.employer?.company_name} ·{" "}
                              {job.location || "Remote"}
                            </p>
                          </div>
                          <Link
                            to={`/jobs/${job.id}`}
                            className="text-xs bg-purple-600 text-white px-3 py-1 rounded-lg"
                          >
                            Apply
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {page === "profile" && <Profile />}
            {page === "applications" && <ApplicationsPage />}
            {page === "saved" && <SavedJobs />}
            {page === "notifications" && <Notifications />}
            {page === "settings" && <SettingsPage />}
          </div>
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
