/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import api from "../../services/api";
import {
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  Eye,
  FileText,
  PlusCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const chartData = [
  { month: "Jan", applications: 12 },
  { month: "Feb", applications: 19 },
  { month: "Mar", applications: 15 },
  { month: "Apr", applications: 28 },
  { month: "May", applications: 24 },
  { month: "Jun", applications: 35 },
  { month: "Jul", applications: 42 },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Open: "bg-green-50 text-green-700 border-green-200",
    Active: "bg-green-50 text-green-700 border-green-200",
    Draft: "bg-gray-50 text-gray-600 border-gray-200",
    Closed: "bg-red-50 text-red-600 border-red-200",
    Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}
    >
      {status}
    </span>
  );
}

export default function EmployerOverview() {
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const name = user?.email?.split("@")[0] ?? "there";
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    interviewsScheduled: 0,
  });
  const [recentJobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/employer/stats"), api.get("/employer/jobs")])
      .then(([s, j]) => {
        setStats(s.data);
        setJobs(j.data.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: "Active Jobs",
      value: stats.activeJobs,
      icon: <Briefcase size={17} />,
      bg: "bg-blue-50",
      color: "text-blue-600",
      change: "+2 this month",
    },
    {
      label: "Total Applicants",
      value: stats.totalApplications,
      icon: <Users size={17} />,
      bg: "bg-violet-50",
      color: "text-violet-600",
      change: "+18 this week",
    },
    {
      label: "Shortlisted",
      value: stats.shortlisted,
      icon: <CheckCircle size={17} />,
      bg: "bg-amber-50",
      color: "text-amber-600",
      change: "4 pending",
    },
    {
      label: "Interviews",
      value: stats.interviewsScheduled,
      icon: <Clock size={17} />,
      bg: "bg-green-50",
      color: "text-green-600",
      change: "2 this week",
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Welcome back, {name} 👋
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Here's what's happening with your hiring today.
          </p>
        </div>
        <button
          onClick={() => navigate("/employer/dashboard/post")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition shadow-sm"
        >
          <PlusCircle size={15} /> Post a New Job
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <div
            key={c.label}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${c.bg} ${c.color} p-2.5 rounded-xl`}>
                {c.icon}
              </div>
              <span className="flex items-center gap-0.5 text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full">
                <ArrowUpRight size={11} />
                {c.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? "—" : c.value}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Application Trends
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Last 7 months</p>
            </div>
            <TrendingUp size={16} className="text-blue-500" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
            >
              <defs>
                <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="applications"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#appGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-1">
            {[
              {
                label: "Post a new job",
                desc: "Reach thousands of candidates",
                icon: <FileText size={14} className="text-blue-500" />,
                path: "/employer/dashboard/post",
              },
              {
                label: "View applicants",
                desc: "Review pending applications",
                icon: <Users size={14} className="text-violet-500" />,
                path: "/employer/dashboard/applicants",
              },
              {
                label: "Browse my jobs",
                desc: "Manage existing postings",
                icon: <Briefcase size={14} className="text-green-500" />,
                path: "/employer/dashboard/jobs",
              },
              {
                label: "Update company info",
                desc: "Keep your profile current",
                icon: <Eye size={14} className="text-amber-500" />,
                path: "/employer/dashboard/profile",
              },
            ].map((a) => (
              <button
                key={a.path}
                onClick={() => navigate(a.path)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group text-left"
              >
                <div className="w-8 h-8 bg-gray-50 group-hover:bg-white rounded-lg border border-gray-100 flex items-center justify-center shrink-0 transition">
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{a.label}</p>
                  <p className="text-xs text-gray-400">{a.desc}</p>
                </div>
                <ChevronRight
                  size={13}
                  className="text-gray-300 group-hover:text-gray-500 transition"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">
            Recent Job Posts
          </h3>
          <button
            onClick={() => navigate("/employer/dashboard/jobs")}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            View all <ChevronRight size={12} />
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-3.5 animate-pulse"
              >
                <div className="w-9 h-9 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-44 bg-gray-100 rounded" />
                  <div className="h-3 w-28 bg-gray-100 rounded" />
                </div>
                <div className="h-5 w-14 bg-gray-100 rounded-full" />
              </div>
            ))
          ) : recentJobs.length === 0 ? (
            <div className="py-12 text-center">
              <Briefcase size={32} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">No jobs posted yet</p>
              <button
                onClick={() => navigate("/employer/dashboard/post")}
                className="mt-2 text-sm text-blue-500 underline"
              >
                Post your first job
              </button>
            </div>
          ) : (
            recentJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition"
              >
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <Briefcase size={14} className="text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {job.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {job.industry?.industry_name ?? "—"} ·{" "}
                    {job.employment_type?.type_name ?? "—"} ·{" "}
                    {new Date(job.created_at).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={job.status?.status_name ?? "Draft"} />
                <button
                  onClick={() => navigate("/employer/dashboard/applicants")}
                  className="text-gray-400 hover:text-blue-500 transition"
                >
                  <Eye size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
