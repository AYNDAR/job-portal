import { useEffect, useState } from "react";
import api from "../../../services/api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface StatsData {
  month: string;
  count: number;
}

interface CategoryData {
  name: string;
  count: number;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function ReportsManagement() {
  const [registrations, setRegistrations] = useState<StatsData[]>([]);
  const [jobPosts, setJobPosts] = useState<StatsData[]>([]);
  const [applications, setApplications] = useState<StatsData[]>([]);
  const [topCategories, setTopCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [regRes, jobsRes, appsRes, catRes] = await Promise.all([
          api.get("/admin/stats/registrations"),
          api.get("/admin/stats/job-posts"),
          api.get("/admin/stats/applications"),
          api.get("/admin/stats/top-categories"),
        ]);
        setRegistrations(regRes.data);
        setJobPosts(jobsRes.data);
        setApplications(appsRes.data);
        setTopCategories(catRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-4">Loading reports...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>

      {/* Registrations Chart */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">
          User Registrations (Last 6 Months)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={registrations}>
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
              name="Registrations"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Job Posts Chart */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">
          Job Posts (Last 6 Months)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={jobPosts}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                borderColor: "#e5e7eb",
              }}
            />
            <Bar dataKey="count" fill="#10b981" name="Job Posts" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Applications Chart */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">
          Applications (Last 6 Months)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={applications}>
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
              stroke="#f59e0b"
              name="Applications"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Categories Pie Chart */}
      {topCategories.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Top Job Categories</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={topCategories}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                label
              >
                {topCategories.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  borderColor: "#e5e7eb",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
