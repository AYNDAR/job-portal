/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FileText,
  FileSpreadsheet,
  FileJson,
  TrendingUp,
  Briefcase,
  Award,
} from "lucide-react";
import api from "../../../services/api";

// Types
interface UserGrowthData {
  month: string;
  users: number;
  employers: number;
  total: number;
}

interface JobPostingData {
  month: string;
  jobs: number;
}

interface ApplicationData {
  month: string;
  applications: number;
}

interface IndustryData {
  name: string;
  value: number;
}

type ReportType = "users" | "jobs" | "applications" | "industry";

export default function Analytics() {
  const [activeReport, setActiveReport] = useState<ReportType>("users");
  const [userGrowth, setUserGrowth] = useState<UserGrowthData[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPostingData[]>([]);
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [industryDistribution, setIndustryDistribution] = useState<
    IndustryData[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Fetch real data from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, jobsRes, appsRes, industryRes] = await Promise.all([
          api.get("/admin/stats/user-growth"),
          api.get("/admin/stats/job-postings"),
          api.get("/admin/stats/applications"),
          api.get("/admin/stats/industry-distribution"),
        ]);
        setUserGrowth(usersRes.data);
        setJobPostings(jobsRes.data);
        setApplications(appsRes.data);
        setIndustryDistribution(industryRes.data);
      } catch (error) {
        console.error("Failed to fetch analytics data", error);
        // Fallback to mock data (remove in production)
        setUserGrowth([
          { month: "Jan", users: 120, employers: 45, total: 165 },
          { month: "Feb", users: 145, employers: 52, total: 197 },
          { month: "Mar", users: 178, employers: 67, total: 245 },
          { month: "Apr", users: 210, employers: 82, total: 292 },
          { month: "May", users: 245, employers: 98, total: 343 },
          { month: "Jun", users: 280, employers: 115, total: 395 },
        ]);
        setJobPostings([
          { month: "Jan", jobs: 45 },
          { month: "Feb", jobs: 52 },
          { month: "Mar", jobs: 67 },
          { month: "Apr", jobs: 82 },
          { month: "May", jobs: 98 },
          { month: "Jun", jobs: 115 },
        ]);
        setApplications([
          { month: "Jan", applications: 89 },
          { month: "Feb", applications: 102 },
          { month: "Mar", applications: 134 },
          { month: "Apr", applications: 165 },
          { month: "May", applications: 198 },
          { month: "Jun", applications: 240 },
        ]);
        setIndustryDistribution([
          { name: "Technology", value: 35 },
          { name: "Healthcare", value: 20 },
          { name: "Finance", value: 18 },
          { name: "Education", value: 12 },
          { name: "Retail", value: 15 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const exportCSV = <T extends Record<string, any>>(
    data: T[],
    filename: string,
  ) => {
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

  const exportJSON = <T,>(data: T[], filename: string) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = (reportName: string) => {
    // You can integrate jspdf or react-pdf here
    alert(`PDF export for ${reportName} report would be generated here.`);
  };

  const renderReport = () => {
    if (loading)
      return <div className="text-center py-12">Loading reports...</div>;
    switch (activeReport) {
      case "users":
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              User & Employer Growth
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#8b5cf6"
                  name="Job Seekers"
                />
                <Line
                  type="monotone"
                  dataKey="employers"
                  stroke="#3b82f6"
                  name="Employers"
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#10b981"
                  name="Total Users"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => exportCSV(userGrowth, "users_growth")}
                className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-1 rounded-lg"
              >
                <FileSpreadsheet size={14} /> CSV
              </button>
              <button
                onClick={() => exportJSON(userGrowth, "users_growth")}
                className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-1 rounded-lg"
              >
                <FileJson size={14} /> JSON
              </button>
              <button
                onClick={() => exportPDF("Users Growth")}
                className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-1 rounded-lg"
              >
                <FileText size={14} /> PDF
              </button>
            </div>
          </div>
        );
      case "jobs":
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Job Postings Over Time
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={jobPostings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="jobs" fill="#f59e0b" name="Job Posts" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => exportCSV(jobPostings, "job_postings")}
                className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-1 rounded-lg"
              >
                <FileSpreadsheet size={14} /> CSV
              </button>
              <button
                onClick={() => exportJSON(jobPostings, "job_postings")}
                className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-1 rounded-lg"
              >
                <FileJson size={14} /> JSON
              </button>
              <button
                onClick={() => exportPDF("Job Postings")}
                className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-1 rounded-lg"
              >
                <FileText size={14} /> PDF
              </button>
            </div>
          </div>
        );
      case "applications":
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Applications Received
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={applications}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="#ef4444"
                  name="Applications"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => exportCSV(applications, "applications")}
                className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-1 rounded-lg"
              >
                <FileSpreadsheet size={14} /> CSV
              </button>
              <button
                onClick={() => exportJSON(applications, "applications")}
                className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-1 rounded-lg"
              >
                <FileJson size={14} /> JSON
              </button>
              <button
                onClick={() => exportPDF("Applications")}
                className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-1 rounded-lg"
              >
                <FileText size={14} /> PDF
              </button>
            </div>
          </div>
        );
      case "industry":
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Job Distribution by Industry
            </h3>
            <div className="flex flex-col md:flex-row gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={industryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {industryDistribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          [
                            "#8b5cf6",
                            "#3b82f6",
                            "#10b981",
                            "#f59e0b",
                            "#ef4444",
                          ][index % 5]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium">
                        Industry
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium">
                        Jobs (%)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {industryDistribution.map((ind) => (
                      <tr key={ind.name} className="border-b">
                        <td className="px-4 py-2 text-sm">{ind.name}</td>
                        <td className="px-4 py-2 text-sm">{ind.value}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => exportCSV(industryDistribution, "industry")}
                className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-1 rounded-lg"
              >
                <FileSpreadsheet size={14} /> CSV
              </button>
              <button
                onClick={() => exportJSON(industryDistribution, "industry")}
                className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-1 rounded-lg"
              >
                <FileJson size={14} /> JSON
              </button>
              <button
                onClick={() => exportPDF("Industry")}
                className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-1 rounded-lg"
              >
                <FileText size={14} /> PDF
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800">Reports & Analytics</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveReport("users")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${activeReport === "users" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"}`}
          >
            <TrendingUp size={14} /> User Growth
          </button>
          <button
            onClick={() => setActiveReport("jobs")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${activeReport === "jobs" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"}`}
          >
            <Briefcase size={14} /> Job Postings
          </button>
          <button
            onClick={() => setActiveReport("applications")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${activeReport === "applications" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"}`}
          >
            <FileText size={14} /> Applications
          </button>
          <button
            onClick={() => setActiveReport("industry")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${activeReport === "industry" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"}`}
          >
            <Award size={14} /> Industry
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">{renderReport()}</div>
    </div>
  );
}
