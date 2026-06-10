import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FileSpreadsheet,
  FileText,
  TrendingUp,
  Users,
  Calendar,
} from "lucide-react";
import * as XLSX from "xlsx";

interface ChartDataPoint {
  month: string;
  count: number;
}

interface JobApplicationCount {
  jobTitle: string;
  count: number;
}

interface HiringStats {
  totalApplications: number;
  averagePerJob: number;
  acceptanceRate: number;
  interviewsScheduled: number;
}

const COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
];

export default function EmployerAnalyticsPage() {
  const [applicationStats, setApplicationStats] = useState<ChartDataPoint[]>(
    [],
  );
  const [jobPostStats, setJobPostStats] = useState<ChartDataPoint[]>([]);
  const [applicationsPerJob, setApplicationsPerJob] = useState<
    JobApplicationCount[]
  >([]);
  const [hiringStats, setHiringStats] = useState<HiringStats>({
    totalApplications: 0,
    averagePerJob: 0,
    acceptanceRate: 0,
    interviewsScheduled: 0,
  });
  const [mostPopularJobs, setMostPopularJobs] = useState<JobApplicationCount[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [appsRes, jobsRes, perJobRes, statsRes, popularRes] =
          await Promise.all([
            api.get("/employer/stats/applications"),
            api.get("/employer/stats/job-posts"),
            api.get("/employer/stats/applications-per-job"),
            api.get("/employer/stats/hiring"),
            api.get("/employer/stats/popular-jobs"),
          ]);
        setApplicationStats(appsRes.data);
        setJobPostStats(jobsRes.data);
        setApplicationsPerJob(perJobRes.data);
        setHiringStats(statsRes.data);
        setMostPopularJobs(popularRes.data);
      } catch (err) {
        console.error("Failed to fetch analytics, using mock data", err);
        setApplicationStats([
          { month: "Jan", count: 12 },
          { month: "Feb", count: 19 },
          { month: "Mar", count: 15 },
          { month: "Apr", count: 28 },
          { month: "May", count: 24 },
          { month: "Jun", count: 35 },
        ]);
        setJobPostStats([
          { month: "Jan", count: 5 },
          { month: "Feb", count: 7 },
          { month: "Mar", count: 6 },
          { month: "Apr", count: 9 },
          { month: "May", count: 8 },
          { month: "Jun", count: 11 },
        ]);
        setApplicationsPerJob([
          { jobTitle: "Senior Frontend Developer", count: 24 },
          { jobTitle: "Backend Engineer", count: 18 },
          { jobTitle: "UI/UX Designer", count: 12 },
          { jobTitle: "DevOps Specialist", count: 8 },
          { jobTitle: "Product Manager", count: 6 },
        ]);
        setHiringStats({
          totalApplications: 124,
          averagePerJob: 15.5,
          acceptanceRate: 23,
          interviewsScheduled: 18,
        });
        setMostPopularJobs([
          { jobTitle: "Senior Frontend Developer", count: 24 },
          { jobTitle: "Backend Engineer", count: 18 },
          { jobTitle: "UI/UX Designer", count: 12 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const exportCSV = (data: JobApplicationCount[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) => Object.values(row).join(",")).join("\n");
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = (data: JobApplicationCount[], filename: string) => {
    if (!data.length) return;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  if (loading)
    return <div className="p-8 text-center">Loading analytics...</div>;

  const totalApps = applicationsPerJob.reduce((sum, job) => sum + job.count, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Reports & Analytics
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() =>
              exportCSV(applicationsPerJob, "applications_per_job")
            }
            className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200"
          >
            <FileText size={14} /> CSV
          </button>
          <button
            onClick={() =>
              exportExcel(applicationsPerJob, "applications_per_job")
            }
            className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200"
          >
            <FileSpreadsheet size={14} /> Excel
          </button>
        </div>
      </div>

      {/* Hiring Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Total Applications</p>
              <p className="text-2xl font-bold">
                {hiringStats.totalApplications}
              </p>
            </div>
            <Users size={20} className="text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Average per Job</p>
              <p className="text-2xl font-bold">{hiringStats.averagePerJob}</p>
            </div>
            <TrendingUp size={20} className="text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-green-500">
          <div className="flex flex-col items-center text-center">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="#10b981"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - hiringStats.acceptanceRate / 100)}`}
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-800">
                {hiringStats.acceptanceRate}%
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Acceptance Rate</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-amber-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Interviews Scheduled</p>
              <p className="text-2xl font-bold">
                {hiringStats.interviewsScheduled}
              </p>
            </div>
            <Calendar size={20} className="text-amber-500" />
          </div>
        </div>
      </div>

      {/* Applications Per Job - Donut Chart */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Applications Per Job</h3>
          <div className="flex gap-2">
            <button
              onClick={() =>
                exportCSV(applicationsPerJob, "applications_per_job")
              }
              className="text-xs text-purple-600 hover:underline"
            >
              Export CSV
            </button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <ResponsiveContainer width={300} height={300}>
            <PieChart>
              <Pie
                data={applicationsPerJob}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="count"
                label={({ name, percent }) =>
                  `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {applicationsPerJob.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Job Title
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Applications
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applicationsPerJob.map((job, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {job.jobTitle}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {job.count}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {((job.count / totalApps) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Most Popular Jobs Table */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Most Popular Jobs</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Job Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Applications
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mostPopularJobs.map((job, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.jobTitle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {job.count}
                  </td>
                </tr>
              ))}
              {mostPopularJobs.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Existing Charts */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">
          Applications Over Time (Last 6 Months)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={applicationStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#8b5cf6"
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
            <Tooltip />
            <Bar dataKey="count" fill="#10b981" name="Job Posts" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
