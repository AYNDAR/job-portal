import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  UsersRound,
  BarChart,
  Building,
  Settings,
  Bell,
  Eye,
  Calendar,
  UserCheck,
  Menu,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { logout } from "../../store/authSlice";
import api from "../../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import PostJobForm from "../../components/employer/PostJobForm";
import EmployerJobs from "../../components/employer/EmployerJobs";
import ApplicantsList from "../../components/employer/ApplicantsList";

// Type for raw job from API
interface ApiJob {
  id: string;
  title: string;
  jobSite?: string;
  employment_type?: { type_name: string };
  applicationsCount?: number;
  status?: { status_name: string };
}

// Type for dashboard‑ready job (after transformation)
interface DashboardJob {
  id: string;
  title: string;
  location: string;
  employment_type: string;
  applicationsCount: number;
  status: string; // "Open" or "Draft"
}

type ActiveView =
  | "dashboard"
  | "jobs"
  | "post"
  | "applicants"
  | "profile"
  | "analytics"
  | "notifications"
  | "settings";

interface ChartData {
  month: string;
  count: number;
}

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveView>("dashboard");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [refreshJobs, setRefreshJobs] = useState(false);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    interviewsScheduled: 0,
  });
  const [recentJobs, setRecentJobs] = useState<DashboardJob[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, jobsRes, chartRes] = await Promise.all([
        api.get("/employer/stats"),
        api.get("/employer/jobs"),
        api.get("/employer/stats/applications"),
      ]);
      setStats(statsRes.data);
      const jobsWithCount: DashboardJob[] = jobsRes.data.map((job: ApiJob) => ({
        id: job.id,
        title: job.title,
        location: job.jobSite || "Remote",
        employment_type: job.employment_type?.type_name || "Full-time",
        applicationsCount: job.applicationsCount || 0,
        status: job.status?.status_name === "Open" ? "Open" : "Draft",
      }));
      setRecentJobs(jobsWithCount.slice(0, 5));
      setChartData(chartRes.data.slice(-7));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const statsCards = [
    {
      title: "Active jobs",
      value: stats.activeJobs,
      icon: <Briefcase className="h-6 w-6 text-blue-500" />,
      trend: "+2 this month",
      bg: "bg-blue-50",
    },
    {
      title: "Total applicants",
      value: stats.totalApplications,
      icon: <UsersRound className="h-6 w-6 text-green-500" />,
      trend: "+18 this week",
      bg: "bg-green-50",
    },
    {
      title: "Shortlisted",
      value: stats.shortlisted,
      icon: <UserCheck className="h-6 w-6 text-yellow-500" />,
      trend: "pending review",
      bg: "bg-yellow-50",
    },
    {
      title: "Interviews",
      value: stats.interviewsScheduled,
      icon: <Calendar className="h-6 w-6 text-purple-500" />,
      trend: "+2 this week",
      bg: "bg-purple-50",
    },
  ];

  const menuItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    { id: "jobs", name: "My jobs", icon: <Briefcase className="h-5 w-5" /> },
    {
      id: "post",
      name: "Post a job",
      icon: <PlusCircle className="h-5 w-5" />,
    },
    {
      id: "applicants",
      name: "Applicants",
      icon: <UsersRound className="h-5 w-5" />,
    },
    {
      id: "profile",
      name: "Company profile",
      icon: <Building className="h-5 w-5" />,
    },
    {
      id: "analytics",
      name: "Analytics",
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      id: "notifications",
      name: "Notifications",
      icon: <Bell className="h-5 w-5" />,
    },
    {
      id: "settings",
      name: "Settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const sidebarWidth = sidebarOpen ? "w-64" : "w-16";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-green-100 text-green-800";
      case "Draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handleJobPosted = () => setRefreshJobs((prev) => !prev);
  const handleJobPublished = () => fetchDashboardData();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${sidebarWidth} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-y-auto shadow-sm`}
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-blue-600">
              JobPortal Employer
            </h1>
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
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ActiveView)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeTab === item.id
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.icon}
              {sidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {user?.email?.split("@")[0]}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {activeTab === "dashboard" && (
          <>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-500">
                  Welcome back, {user?.email?.split("@")[0] || "Employer"} 🎉
                </p>
                <p className="text-sm text-gray-400">
                  Here's what's happening with your hiring today
                </p>
              </div>
              <button
                onClick={() => setActiveTab("post")}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                <PlusCircle className="h-4 w-4" /> Post a job
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {statsCards.map((card) => (
                <div
                  key={card.title}
                  className={`${card.bg} p-5 rounded-xl shadow-sm`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600">{card.title}</p>
                      {loading ? (
                        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
                      ) : (
                        <p className="text-2xl font-bold text-gray-800">
                          {card.value}
                        </p>
                      )}
                      <p className="text-xs text-green-600 mt-1">
                        {card.trend}
                      </p>
                    </div>
                    {card.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* Chart + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Application trends
                  </h3>
                  <span className="text-xs text-gray-400">Last 7 months</span>
                </div>
                {loading ? (
                  <div className="h-64 bg-gray-100 animate-pulse rounded"></div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          borderColor: "#e5e7eb",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Quick actions
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab("post")}
                    className="w-full flex items-center gap-2 p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    <PlusCircle className="h-5 w-5" /> Post a new job
                  </button>
                  <button
                    onClick={() => setActiveTab("applicants")}
                    className="w-full flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100"
                  >
                    <Eye className="h-5 w-5" /> View applicants
                  </button>
                  <button
                    onClick={() => setActiveTab("jobs")}
                    className="w-full flex items-center gap-2 p-3 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100"
                  >
                    <Briefcase className="h-5 w-5" /> Browse my jobs
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Job Posts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  Recent job posts
                </h3>
                <button
                  onClick={() => setActiveTab("jobs")}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View all →
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {loading ? (
                  Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="p-4 animate-pulse bg-gray-50 h-20"
                      ></div>
                    ))
                ) : recentJobs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No jobs posted yet.
                  </div>
                ) : (
                  recentJobs.map((job) => (
                    <div
                      key={job.id}
                      className="px-5 py-4 flex justify-between items-center hover:bg-gray-50"
                    >
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {job.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {job.location} • {job.employment_type} •{" "}
                          {job.applicationsCount} applicants
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusBadge(job.status)}`}
                      >
                        {job.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "jobs" && (
          <EmployerJobs
            onSelectJob={(jobId: string) => {
              setSelectedJobId(jobId);
              setActiveTab("applicants");
            }}
            refreshTrigger={refreshJobs}
            onPublish={handleJobPublished}
          />
        )}
        {activeTab === "post" && <PostJobForm onSuccess={handleJobPosted} />}
        {activeTab === "applicants" &&
          (selectedJobId ? (
            <ApplicantsList key={selectedJobId} />
          ) : (
            <div className="text-gray-500">
              Select a job from "My Jobs" to view applicants.
            </div>
          ))}
        {activeTab === "profile" && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            Company Profile – coming soon
          </div>
        )}
        {activeTab === "analytics" && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            Analytics – coming soon
          </div>
        )}
        {activeTab === "notifications" && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            Notifications – coming soon
          </div>
        )}
        {activeTab === "settings" && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            Settings – coming soon
          </div>
        )}
      </main>
    </div>
  );
}
