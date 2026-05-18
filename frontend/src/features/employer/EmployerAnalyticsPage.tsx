import { useEffect, useState } from "react";
import api from "../../services/api";
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
} from "recharts";

export default function EmployerAnalytics() {
  const [applicationStats, setApplicationStats] = useState([]);
  const [jobPostStats, setJobPostStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [appsRes, jobsRes] = await Promise.all([
          api.get("/employer/stats/applications"),
          api.get("/employer/stats/job-posts"),
        ]);
        setApplicationStats(appsRes.data);
        setJobPostStats(jobsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-4">Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Analytics</h2>

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">
          Applications Over Time (Last 6 Months)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={applicationStats}>
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
              name="Applications"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">
          Job Posts Over Time (Last 6 Months)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={jobPostStats}>
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
    </div>
  );
}
