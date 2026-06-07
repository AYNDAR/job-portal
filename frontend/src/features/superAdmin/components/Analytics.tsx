import { useEffect, useState } from "react";
import api from "../../../services/api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface MonthlyData {
  month: string;
  count: number;
}

interface RoleData {
  name: string;
  value: number;
}

export default function Analytics() {
  const [userStats, setUserStats] = useState<MonthlyData[]>([]);
  const [jobStats, setJobStats] = useState<MonthlyData[]>([]);
  const [appStats, setAppStats] = useState<MonthlyData[]>([]);
  const [roleDistribution, setRoleDistribution] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, jobs, apps, roles] = await Promise.all([
          api.get("/admin/stats/registrations"),
          api.get("/admin/stats/job-posts"),
          api.get("/admin/stats/applications"),
          api.get("/admin/stats/role-distribution"),
        ]);
        setUserStats(users.data);
        setJobStats(jobs.data);
        setAppStats(apps.data);
        setRoleDistribution(roles.data);
      } catch (error) {
        console.error("Analytics error", error);
        // Mock data fallback
        setUserStats([
          { month: "Jan", count: 120 },
          { month: "Feb", count: 145 },
          { month: "Mar", count: 178 },
        ]);
        setJobStats([
          { month: "Jan", count: 45 },
          { month: "Feb", count: 52 },
          { month: "Mar", count: 67 },
        ]);
        setAppStats([
          { month: "Jan", count: 89 },
          { month: "Feb", count: 102 },
          { month: "Mar", count: 134 },
        ]);
        setRoleDistribution([
          { name: "Job Seekers", value: 850 },
          { name: "Employers", value: 210 },
          { name: "Admins", value: 12 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"];

  if (loading)
    return <div className="p-8 text-center">Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Platform Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">
            User Registrations Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8b5cf6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Job Posts Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={jobStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Applications Received</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={appStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#f59e0b"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">User Role Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={roleDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {roleDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
