import { useEffect, useState } from "react";
import api from "../../../services/api";
import { Users, Briefcase, FileText, Eye } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RecentJob {
  id: string;
  title: string;
  employer?: { company_name: string };
}

interface RecentUser {
  id: string;
  email: string;
  created_at: string;
  user_type?: { type_name: string };
}

const chartData = [
  { month: "Jan", users: 40, jobs: 24 },
  { month: "Feb", users: 45, jobs: 28 },
  { month: "Mar", users: 52, jobs: 35 },
  { month: "Apr", users: 58, jobs: 42 },
  { month: "May", users: 65, jobs: 48 },
  { month: "Jun", users: 70, jobs: 55 },
  { month: "Jul", users: 78, jobs: 62 },
];

export default function DashboardHome() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalEmployers: 0,
  });
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, jobsRes, usersRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/recent-jobs"),
          api.get("/admin/recent-users"),
        ]);
        setStats(statsRes.data);
        setRecentJobs(jobsRes.data);
        setRecentUsers(usersRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users className="h-6 w-6 text-blue-600" />,
      trend: "+12% this month",
    },
    {
      title: "Active Jobs",
      value: stats.activeJobs,
      icon: <Briefcase className="h-6 w-6 text-green-600" />,
      trend: "+8% this month",
    },
    {
      title: "Applications",
      value: stats.totalApplications,
      icon: <FileText className="h-6 w-6 text-yellow-600" />,
      trend: "+21% this month",
    },
    {
      title: "Employers",
      value: stats.totalEmployers,
      icon: <Briefcase className="h-6 w-6 text-purple-600" />,
      trend: "+5% this month",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <p className="text-green-600 text-xs mt-1">{card.trend}</p>
              </div>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Chart and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Monthly growth
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  borderColor: "#e5e7eb",
                }}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#3b82f6"
                name="Users"
              />
              <Line
                type="monotone"
                dataKey="jobs"
                stroke="#10b981"
                name="Jobs"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Quick actions
          </h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Users className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Manage users</p>
                <p className="text-xs text-gray-500">View & suspend</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <FileText className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Moderate jobs</p>
                <p className="text-xs text-gray-500">Review posts</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Jobs & Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent job posts
            </h3>
            <button className="text-blue-600 text-sm hover:underline">
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {recentJobs.slice(0, 3).map((job) => (
              <div
                key={job.id}
                className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-sm">{job.title}</p>
                  <p className="text-xs text-gray-500">
                    {job.employer?.company_name || "Unknown"}
                  </p>
                </div>
                <Eye className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent users
            </h3>
            <button className="text-blue-600 text-sm hover:underline">
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {recentUsers.slice(0, 3).map((user) => (
              <div
                key={user.id}
                className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-sm">{user.email}</p>
                  <p className="text-xs text-gray-500">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {user.user_type?.type_name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
