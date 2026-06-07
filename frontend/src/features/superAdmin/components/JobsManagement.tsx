import { useEffect, useState } from "react";
import api from "../../../services/api";
import { Search, Eye, Trash2, X } from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
  salary_range: string;
  created_at: string;
  employer: { company_name: string; location?: string };
  industry: { industry_name: string };
  employment_type: { type_name: string };
  status: { status_name: string };
  jobSite?: string;
  experienceLevel?: string;
  educationLevel?: string;
  application_deadline?: string;
  skills?: string[];
}

export default function JobsManagement() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filtered, setFiltered] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/jobs");
      setJobs(res.data);
      setFiltered(res.data);
    } catch (error) {
      console.error("Failed to fetch jobs, using mock data", error);
      const mockJobs: Job[] = [
        {
          id: "1",
          title: "Senior React Developer",
          description: "We are looking for a React expert...",
          salary_range: "$80k - $100k",
          created_at: new Date().toISOString(),
          employer: { company_name: "TechCorp", location: "Addis Ababa" },
          industry: { industry_name: "Technology" },
          employment_type: { type_name: "Full-time" },
          status: { status_name: "Open" },
          jobSite: "Remote",
          experienceLevel: "Senior",
          educationLevel: "Bachelor",
          application_deadline: new Date(
            Date.now() + 30 * 86400000,
          ).toISOString(),
          skills: ["React", "TypeScript", "Node.js"],
        },
        {
          id: "2",
          title: "Marketing Manager",
          description: "Lead marketing campaigns...",
          salary_range: "$50k - $70k",
          created_at: new Date().toISOString(),
          employer: { company_name: "AdAgency", location: "Nairobi" },
          industry: { industry_name: "Marketing" },
          employment_type: { type_name: "Full-time" },
          status: { status_name: "Closed" },
          jobSite: "Onsite",
        },
      ];
      setJobs(mockJobs);
      setFiltered(mockJobs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    let result = [...jobs];
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(term) ||
          j.employer.company_name.toLowerCase().includes(term) ||
          j.industry.industry_name.toLowerCase().includes(term),
      );
    }
    if (statusFilter !== "All") {
      result = result.filter((j) => j.status.status_name === statusFilter);
    }
    setFiltered(result);
  }, [search, statusFilter, jobs]);

  const closeJob = async (jobId: string) => {
    if (
      !confirm(
        "Close this job posting? It will no longer be visible to seekers.",
      )
    )
      return;
    setActionLoading(jobId);
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, status: { status_name: "Closed" } } : j,
      ),
    );
    setFiltered((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, status: { status_name: "Closed" } } : j,
      ),
    );
    try {
      await api.patch(`/admin/jobs/${jobId}/close`);
    } catch (error) {
      console.warn("API close failed, UI already updated");
    } finally {
      setActionLoading(null);
    }
  };

  const openJob = async (jobId: string) => {
    if (!confirm("Reopen this job posting? It will become visible to seekers."))
      return;
    setActionLoading(jobId);
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, status: { status_name: "Open" } } : j,
      ),
    );
    setFiltered((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, status: { status_name: "Open" } } : j,
      ),
    );
    try {
      await api.patch(`/admin/jobs/${jobId}/open`);
    } catch (error) {
      console.warn("API open failed, UI already updated");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteJob = async (jobId: string, title: string) => {
    if (!confirm(`Delete job "${title}"? This action cannot be undone.`))
      return;
    setActionLoading(jobId);
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    setFiltered((prev) => prev.filter((j) => j.id !== jobId));
    try {
      await api.delete(`/admin/jobs/${jobId}`);
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete job. Please try again.");
      await fetchJobs();
    } finally {
      setActionLoading(null);
    }
  };

  const viewJobDetails = (job: Job) => setViewingJob(job);
  const closeModal = () => setViewingJob(null);

  if (loading) return <div className="p-8 text-center">Loading jobs...</div>;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by title, company or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-100"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white"
        >
          <option value="All">All Status</option>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
          <option value="Draft">Draft</option>
        </select>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Industry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((job) => (
                <tr key={job.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {job.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {job.employer.company_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.industry.industry_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.salary_range || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.employer.location || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        job.status.status_name === "Open"
                          ? "bg-green-100 text-green-700"
                          : job.status.status_name === "Closed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {job.status.status_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    {job.status.status_name === "Open" ? (
                      <button
                        onClick={() => closeJob(job.id)}
                        disabled={actionLoading === job.id}
                        className="text-red-600 hover:text-red-800"
                      >
                        Close
                      </button>
                    ) : (
                      <button
                        onClick={() => openJob(job.id)}
                        disabled={actionLoading === job.id}
                        className="text-green-600 hover:text-green-800"
                      >
                        Open
                      </button>
                    )}
                    <button
                      onClick={() => viewJobDetails(job)}
                      className="text-blue-600 hover:text-blue-800"
                      title="View Details"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => deleteJob(job.id, job.title)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No jobs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Job Details Modal */}
      {viewingJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Job Details</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <strong>Title:</strong> {viewingJob.title}
              </div>
              <div>
                <strong>Company:</strong> {viewingJob.employer.company_name}
              </div>
              <div>
                <strong>Industry:</strong> {viewingJob.industry.industry_name}
              </div>
              <div>
                <strong>Employment Type:</strong>{" "}
                {viewingJob.employment_type.type_name}
              </div>
              <div>
                <strong>Salary Range:</strong>{" "}
                {viewingJob.salary_range || "Not specified"}
              </div>
              <div>
                <strong>Location:</strong>{" "}
                {viewingJob.employer.location || "Not specified"}
              </div>
              <div>
                <strong>Job Site:</strong>{" "}
                {viewingJob.jobSite || "Not specified"}
              </div>
              <div>
                <strong>Experience Level:</strong>{" "}
                {viewingJob.experienceLevel || "Not specified"}
              </div>
              <div>
                <strong>Education Level:</strong>{" "}
                {viewingJob.educationLevel || "Not specified"}
              </div>
              <div>
                <strong>Application Deadline:</strong>{" "}
                {viewingJob.application_deadline
                  ? new Date(
                      viewingJob.application_deadline,
                    ).toLocaleDateString()
                  : "Not set"}
              </div>
              <div>
                <strong>Skills Required:</strong>{" "}
                {viewingJob.skills?.join(", ") || "None"}
              </div>
              <div>
                <strong>Description:</strong>{" "}
                <div className="mt-1 text-gray-700 whitespace-pre-line">
                  {viewingJob.description}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
