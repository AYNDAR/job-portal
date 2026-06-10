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
  Trash2,
  ChevronDown,
  Edit2,
  XCircle,
  CheckCircle,
  X,
  Loader2,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Open: "bg-green-50 text-green-700 border-green-200",
    Active: "bg-green-50 text-green-700 border-green-200",
    Published: "bg-green-50 text-green-700 border-green-200",
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

export default function EmployerJobsPage() {
  const navigate = useNavigate();
  const { token } = useAppSelector((state) => state.auth);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filtered, setFiltered] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatus] = useState("All");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    salary_range: "",
    location: "",
  });
  const [saving, setSaving] = useState(false);

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
    if (search)
      result = result.filter((j) =>
        j.title.toLowerCase().includes(search.toLowerCase()),
      );
    if (statusFilter !== "All")
      result = result.filter((j) => j.status?.status_name === statusFilter);
    setFiltered(result);
  }, [search, statusFilter, jobs]);

  const closeJob = async (jobId: string) => {
    if (
      !confirm("Close this job? It will no longer be visible to job seekers.")
    )
      return;
    setActionLoading(jobId);
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, status: { status_name: "Closed" } } : j,
      ),
    );
    try {
      await api.patch(`/employer/jobs/${jobId}/close`);
      await fetchJobs();
    } catch {
      alert("Failed to close job");
      await fetchJobs();
    } finally {
      setActionLoading(null);
    }
  };

  const reopenJob = async (jobId: string) => {
    if (!confirm("Reopen this job? It will become visible to job seekers."))
      return;
    setActionLoading(jobId);
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, status: { status_name: "Open" } } : j,
      ),
    );
    try {
      await api.patch(`/employer/jobs/${jobId}/open`);
      await fetchJobs();
    } catch {
      alert("Failed to reopen job");
      await fetchJobs();
    } finally {
      setActionLoading(null);
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm("Delete this job post? This action cannot be undone.")) return;
    setActionLoading(jobId);
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    try {
      await api.delete(`/employer/jobs/${jobId}`);
    } catch {
      alert("Failed to delete job");
      await fetchJobs();
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setEditForm({
      title: job.title,
      description: job.description,
      salary_range: job.salary_range || "",
      location: job.location || "",
    });
  };

  const closeEditModal = () => {
    setEditingJob(null);
    setEditForm({ title: "", description: "", salary_range: "", location: "" });
  };

  const saveEdit = async () => {
    if (!editingJob) return;
    setSaving(true);
    try {
      await api.put(`/employer/jobs/${editingJob.id}`, editForm);
      await fetchJobs();
      closeEditModal();
    } catch {
      alert("Failed to update job");
    } finally {
      setSaving(false);
    }
  };

  const viewApplicants = (jobId: string) => {
    navigate(`/employer/dashboard/applicants?jobId=${jobId}`);
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">My Job Posts</h2>
          <p className="text-sm text-gray-500">
            {filtered.length} job{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => navigate("/employer/dashboard/post")}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition shadow-sm"
        >
          <PlusCircle size={15} /> Post a Job
        </button>
      </div>

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
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300 transition"
          />
        </div>
        <div className="relative">
          <Filter
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatus(e.target.value)}
            className="pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 appearance-none bg-white cursor-pointer"
          >
            {["All", "Open", "Closed", "Draft", "Pending", "Published"].map(
              (s) => (
                <option key={s}>{s}</option>
              ),
            )}
          </select>
          <ChevronDown
            size={12}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

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
              className="text-sm text-purple-600 underline"
            >
              Post your first job
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((job) => (
              <div
                key={job.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition group"
              >
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                  <Briefcase size={16} className="text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {job.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-0.5">
                    {job.industry?.industry_name && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Briefcase size={11} /> {job.industry.industry_name}
                      </span>
                    )}
                    {job.jobSite && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={11} /> {job.jobSite}
                      </span>
                    )}
                    {job.employment_type?.type_name && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={11} /> {job.employment_type.type_name}
                      </span>
                    )}
                    <span className="text-xs text-gray-300">
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {job.salary_range && (
                  <span className="hidden md:block text-sm text-gray-600 font-medium">
                    {job.salary_range}
                  </span>
                )}
                <StatusBadge status={job.status?.status_name ?? "Draft"} />
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => viewApplicants(job.id)}
                    title="View applicants"
                    className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => openEditModal(job)}
                    title="Edit job"
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit2 size={14} />
                  </button>
                  {job.status?.status_name === "Open" && (
                    <button
                      onClick={() => closeJob(job.id)}
                      disabled={actionLoading === job.id}
                      title="Close job"
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                    >
                      <XCircle size={14} />
                    </button>
                  )}
                  {job.status?.status_name === "Closed" && (
                    <button
                      onClick={() => reopenJob(job.id)}
                      disabled={actionLoading === job.id}
                      title="Reopen job"
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                    >
                      <CheckCircle size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteJob(job.id)}
                    disabled={actionLoading === job.id}
                    title="Delete job"
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={closeEditModal}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Edit Job</h3>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary Range
                </label>
                <input
                  type="text"
                  value={editForm.salary_range}
                  onChange={(e) =>
                    setEditForm({ ...editForm, salary_range: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2"
                  placeholder="e.g., $60k – $80k"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2"
                  placeholder="City, Country or Remote"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-1"
                >
                  {saving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
