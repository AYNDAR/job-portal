import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAppSelector } from "../../store/hooks";
import type { Job } from "./types";
import {
  Search,
  PlusCircle,
  Briefcase,
  MapPin,
  Clock,
  Filter,
  Eye,
  Send,
  Trash2,
  ChevronDown,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: "bg-green-50 text-green-700 border-green-200",
    Published: "bg-green-50 text-green-700 border-green-200",
    Draft: "bg-gray-50 text-gray-600 border-gray-200",
    Closed: "bg-red-50 text-red-600 border-red-200",
    Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  };
  const cls = map[status] ?? "bg-gray-50 text-gray-600 border-gray-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {status}
    </span>
  );
}

export default function EmployerJobsPage() {
  const navigate = useNavigate();
  const { token } = useAppSelector((state) => state.auth);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filtered, setFiltered] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [publishing, setPublishing] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      const res = await api.get("/employer/jobs");
      setJobs(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchJobs();
  }, [token]);

  useEffect(() => {
    let result = [...jobs];
    if (search) {
      result = result.filter((j) =>
        j.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== "All") {
      result = result.filter(
        (j) => j.status?.status_name === statusFilter
      );
    }
    setFiltered(result);
  }, [search, statusFilter, jobs]);

  const publishJob = async (jobId: string) => {
    if (!confirm("Publish this job? It will become visible to job seekers."))
      return;
    setPublishing(jobId);
    try {
      await api.patch(`/employer/jobs/${jobId}/publish`);
      await fetchJobs();
    } catch {
      alert("Failed to publish job.");
    } finally {
      setPublishing(null);
    }
  };

  const statuses = ["All", "Active", "Draft", "Closed", "Pending", "Published"];

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">My Job Posts</h2>
          <p className="text-sm text-gray-500">
            {filtered.length} job{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => navigate("/employer/dashboard/post")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition shadow-sm"
        >
          <PlusCircle size={15} /> Post a Job
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
          />
        </div>
        <div className="relative">
          <Filter
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none bg-white cursor-pointer"
          >
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <ChevronDown
            size={12}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Jobs list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-4 animate-pulse"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-gray-100 rounded" />
                  <div className="h-3 w-64 bg-gray-100 rounded" />
                </div>
                <div className="h-6 w-16 bg-gray-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Briefcase size={36} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-500">No jobs found</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => navigate("/employer/dashboard/post")}
              className="text-sm text-blue-600 underline"
            >
              Post your first job
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((job) => (
              <div
                key={job.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
              >
                {/* Icon */}
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Briefcase size={16} className="text-blue-500" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {job.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-0.5">
                    {job.industry?.industry_name && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Briefcase size={11} />
                        {job.industry.industry_name}
                      </span>
                    )}
                    {job.jobSite && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={11} />
                        {job.jobSite}
                      </span>
                    )}
                    {job.employment_type?.type_name && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={11} />
                        {job.employment_type.type_name}
                      </span>
                    )}
                    <span className="text-xs text-gray-300">
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Salary */}
                {job.salary_range && (
                  <span className="hidden md:block text-sm text-gray-600 font-medium">
                    {job.salary_range}
                  </span>
                )}

                {/* Status */}
                <StatusBadge status={job.status?.status_name ?? "Draft"} />

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => navigate("/employer/dashboard/applicants")}
                    title="View applicants"
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Eye size={14} />
                  </button>
                  {job.status?.status_name === "Draft" && (
                    <button
                      onClick={() => publishJob(job.id)}
                      disabled={publishing === job.id}
                      title="Publish job"
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                    >
                      <Send size={14} />
                    </button>
                  )}
                  <button
                    title="Delete job"
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
