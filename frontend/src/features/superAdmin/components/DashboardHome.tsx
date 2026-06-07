import { useEffect, useState } from "react";
import api from "../../../services/api";
import {
  Users,
  Briefcase,
  FileText,
  Shield,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartDataPoint {
  month: string;
  count: number;
}

export default function DashboardHome() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    totalAdmins: 0,
  });
  const [trends, setTrends] = useState({
    usersGrowth: 0,
    jobsGrowth: 0,
    applicationsGrowth: 0,
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, trendsRes, chartRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/stats/trends"),
          api.get("/admin/stats/registrations"),
        ]);
        setStats(statsRes.data);
        setTrends(trendsRes.data);
        setChartData(chartRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        // Mock data fallback
        setStats({
          totalUsers: 1250,
          totalJobs: 342,
          totalApplications: 2780,
          totalAdmins: 8,
        });
        setTrends({ usersGrowth: 12, jobsGrowth: 8, applicationsGrowth: 23 });
        setChartData([
          { month: "Jan", count: 120 },
          { month: "Feb", count: 145 },
          { month: "Mar", count: 178 },
          { month: "Apr", count: 210 },
          { month: "May", count: 245 },
          { month: "Jun", count: 280 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users size={24} />,
      color: "blue",
      growth: trends.usersGrowth,
    },
    {
      title: "Active Jobs",
      value: stats.totalJobs,
      icon: <Briefcase size={24} />,
      color: "green",
      growth: trends.jobsGrowth,
    },
    {
      title: "Applications",
      value: stats.totalApplications,
      icon: <FileText size={24} />,
      color: "yellow",
      growth: trends.applicationsGrowth,
    },
    {
      title: "Admin Accounts",
      value: stats.totalAdmins,
      icon: <Shield size={24} />,
      color: "purple",
      growth: 0,
    },
  ];

  const colorClasses = {
    blue: "border-blue-500 text-blue-500",
    green: "border-green-500 text-green-500",
    yellow: "border-yellow-500 text-yellow-500",
    purple: "border-purple-500 text-purple-500",
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        Loading dashboard...
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div
            key={card.title}
            className={`bg-white rounded-xl shadow-sm border-l-4 ${colorClasses[card.color as keyof typeof colorClasses]} p-5`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800">
                  {card.value.toLocaleString()}
                </p>
                {card.growth !== 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    {card.growth > 0 ? (
                      <TrendingUp size={14} className="text-green-500" />
                    ) : (
                      <TrendingDown size={14} className="text-red-500" />
                    )}
                    <span
                      className={`text-xs ${card.growth > 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {Math.abs(card.growth)}% from last month
                    </span>
                  </div>
                )}
              </div>
              <div className={`p-2 rounded-lg bg-${card.color}-50`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          User Registrations (Last 6 Months)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
