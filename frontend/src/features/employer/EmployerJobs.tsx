import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAppSelector } from "../../store/hooks";
import type { Job } from "./types";
import JobFilterSidebar from "../../components/employer/JobFilterSidebar";

interface EmployerJobsProps {
  onSelectJob: (jobId: string) => void;
  refreshTrigger?: boolean;
  onPublish?: () => void;
}

export default function EmployerJobs({
  onSelectJob,
  refreshTrigger,
  onPublish,
}: EmployerJobsProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAppSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    industry: "",
    employmentType: "",
    jobSite: "",
  });

  const fetchJobs = async () => {
    try {
      const res = await api.get("/employer/jobs");
      setJobs(res.data);
      setFilteredJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setLoading(false);
    }
  };

  const publishJob = async (jobId: string) => {
    if (!confirm("Publish this job? It will become visible to job seekers."))
      return;
    try {
      await api.patch(`/employer/jobs/${jobId}/publish`);
      await fetchJobs();
      if (onPublish) onPublish();
    } catch (err) {
      console.error(err);
      alert("Failed to publish job");
    }
  };

  useEffect(() => {
    if (token) fetchJobs();
  }, [token, refreshTrigger]);

  useEffect(() => {
    let filtered = [...jobs];
    if (searchTerm) {
      filtered = filtered.filter((job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (filters.industry) {
      filtered = filtered.filter(
        (job) => job.industry?.industry_name === filters.industry,
      );
    }
    if (filters.employmentType) {
      filtered = filtered.filter(
        (job) => job.employment_type?.type_name === filters.employmentType,
      );
    }
    if (filters.jobSite) {
      filtered = filtered.filter((job) => job.jobSite === filters.jobSite);
    }
    setFilteredJobs(filtered);
  }, [jobs, searchTerm, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="p-4">Loading your jobs...</div>;

  return (
    <div className="flex gap-6">
      {/* Sticky Sidebar */}
      <div className="w-64 shrink-0">
        <JobFilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Right side: Search + Table */}
      <div className="flex-1 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search job title
          </label>
          <input
            type="text"
            placeholder="Type job title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border rounded-md p-2"
            list="job-titles"
          />
          <datalist id="job-titles">
            {jobs.map((job) => (
              <option key={job.id} value={job.title} />
            ))}
          </datalist>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="bg-white p-8 rounded-lg text-center text-gray-500">
            No jobs match your filters.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Posted Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {job.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(job.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => onSelectJob(job.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View Applicants
                      </button>
                      {job.status.status_name === "Draft" && (
                        <button
                          onClick={() => publishJob(job.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          Publish
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
