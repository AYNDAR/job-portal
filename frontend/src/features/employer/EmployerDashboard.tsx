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
  Plus,
  Eye,
  Check,
  Calendar,
  UserCheck,
  Home,
  Menu,
  ChevronLeft,
} from "lucide-react";
import api from "../../services/api";
import PostJobForm from "../../components/employer/PostJobForm";
import EmployerJobs from "../../components/employer/EmployerJobs";
import ApplicantsList from "../../components/employer/ApplicantsList";
import EmployerAnalytics from "./EmployerAnalyticsPage";
import CompanyProfile from "./CompanyProfilePage";
import EmployerSettings from "./EmployerSettingsPage";

// === Type definitions ===
type ActiveView =
  | "overview"
  | "jobs"
  | "post"
  | "applicants"
  | "analytics"
  | "profile"
  | "settings";

interface RecentJob {
  id: string;
  title: string;
  applicationsCount?: number;
  employer?: { location?: string };
  status?: { status_name: string };
}

interface RecentApplicant {
  id: string;
  seeker: { full_name: string };
  job: { title: string };
  status: { status_name: string };
  applied_at: string;
}

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>("overview");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [refreshJobs, setRefreshJobs] = useState(false);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    interviewsScheduled: 0,
  });
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [recentApplicants, setRecentApplicants] = useState<RecentApplicant[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, jobsRes, applicantsRes] = await Promise.all([
        api.get("/employer/stats"),
        api.get("/employer/jobs"),
        api.get("/employer/recent-applicants"),
      ]);
      setStats(statsRes.data);
      setRecentJobs(jobsRes.data.slice(0, 3));
      setRecentApplicants(applicantsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleJobPosted = () => {
    setRefreshJobs((prev) => !prev);
    fetchDashboardData();
  };

  const handleJobPublished = () => {
    fetchDashboardData();
  };

  const statsCards = [
    {
      title: "Active Jobs",
      value: stats.activeJobs,
      icon: <Briefcase className="h-6 w-6 text-blue-600" />,
      trend: "+2 this month",
    },
    {
      title: "Total Applicants",
      value: stats.totalApplications,
      icon: <UsersRound className="h-6 w-6 text-green-600" />,
      trend: "+18 this week",
    },
    {
      title: "Interviews",
      value: stats.shortlisted,
      icon: <Calendar className="h-6 w-6 text-yellow-600" />,
      trend: "scheduled",
    },
    {
      title: "Hired",
      value: 3,
      icon: <UserCheck className="h-6 w-6 text-purple-600" />,
      trend: "this quarter",
    },
  ];

  const menuItems = [
    {
      id: "home",
      name: "Home",
      icon: <Home className="h-5 w-5" />,
      isHome: true,
    },
    {
      id: "overview",
      name: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    { id: "jobs", name: "My Jobs", icon: <Briefcase className="h-5 w-5" /> },
    {
      id: "post",
      name: "Post a Job",
      icon: <PlusCircle className="h-5 w-5" />,
    },
    {
      id: "applicants",
      name: "Applicants",
      icon: <UsersRound className="h-5 w-5" />,
    },
    {
      id: "analytics",
      name: "Analytics",
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      id: "profile",
      name: "Company Profile",
      icon: <Building className="h-5 w-5" />,
    },
    {
      id: "settings",
      name: "Settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Reviewing":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const sidebarWidth = sidebarOpen ? "w-64" : "w-16";

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside
        className={`${sidebarWidth} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-y-auto`}
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-blue-600">JobPortal</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) =>
            item.isHome ? (
              <button
                key={item.id}
                onClick={() => navigate("/jobs")}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-gray-700 hover:bg-gray-100"
                title={!sidebarOpen ? item.name : ""}
                aria-label={item.name}
              >
                {item.icon}
                {sidebarOpen && <span>{item.name}</span>}
              </button>
            ) : (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as ActiveView)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeView === item.id ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"}`}
                title={!sidebarOpen ? item.name : ""}
                aria-label={item.name}
              >
                {item.icon}
                {sidebarOpen && <span>{item.name}</span>}
              </button>
            ),
          )}
        </nav>
        <div className="p-4 text-xs text-gray-500 border-t border-gray-200 text-center">
          {sidebarOpen ? "© JobPortal" : "©"}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {activeView === "overview" && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
              <div className="flex items-center gap-3">
                <button
                  aria-label="Notifications"
                  className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 relative"
                >
                  <Bell className="w-5 h-5 text-gray-500" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button
                  onClick={() => setActiveView("post")}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" /> Post a Job
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsCards.map((card) => (
                <div
                  key={card.title}
                  className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm">{card.title}</p>
                      {loading ? (
                        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
                      ) : (
                        <p className="text-2xl font-bold text-gray-800">
                          {card.value}
                        </p>
                      )}
                      <p className="text-green-600 text-xs mt-1">
                        {card.trend}
                      </p>
                    </div>
                    {card.icon}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">
                    Recent Job Posts
                  </h3>
                  <button
                    onClick={() => setActiveView("jobs")}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    View all →
                  </button>
                </div>
                <div className="space-y-3">
                  {recentJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-sm">{job.title}</h4>
                        <p className="text-xs text-gray-500">
                          {job.applicationsCount || 0} applicants •{" "}
                          {job.employer?.location || "Remote"}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusClass(job.status?.status_name === "Open" ? "Active" : "Reviewing")}`}
                      >
                        {job.status?.status_name === "Open"
                          ? "Active"
                          : "Draft"}
                      </span>
                    </div>
                  ))}
                  {recentJobs.length === 0 && (
                    <p className="text-gray-500 text-sm">No jobs posted yet.</p>
                  )}
                </div>
              </section>
              <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">
                    Recent Applicants
                  </h3>
                  <button
                    onClick={() => setActiveView("applicants")}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    View all →
                  </button>
                </div>
                <div className="space-y-3">
                  {recentApplicants.map((app) => (
                    <div
                      key={app.id}
                      className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold uppercase">
                          {app.seeker.full_name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">
                            {app.seeker.full_name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {app.job.title}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="p-1.5 bg-gray-50 rounded border border-gray-200 hover:text-blue-600"
                          aria-label="View applicant details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="p-1.5 bg-gray-50 rounded border border-gray-200 hover:text-green-600"
                          aria-label="Shortlist applicant"
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {recentApplicants.length === 0 && (
                    <p className="text-gray-500 text-sm">No applicants yet.</p>
                  )}
                </div>
              </section>
            </div>
          </>
        )}
        {activeView === "jobs" && (
          <EmployerJobs
            onSelectJob={(jobId: string) => {
              setSelectedJobId(jobId);
              setActiveView("applicants");
            }}
            refreshTrigger={refreshJobs}
            onPublish={handleJobPublished}
          />
        )}
        {activeView === "post" && <PostJobForm onSuccess={handleJobPosted} />}
        {activeView === "applicants" &&
          (selectedJobId ? (
            <ApplicantsList jobId={selectedJobId} />
          ) : (
            <div className="text-gray-500">
              Select a job from "My Jobs" to view applicants.
            </div>
          ))}
        {activeView === "analytics" && <EmployerAnalytics />}
        {activeView === "profile" && <CompanyProfile />}
        {activeView === "settings" && <EmployerSettings />}
      </main>
    </div>
  );
}
