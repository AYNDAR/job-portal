/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import api from "../../services/api";
import { MapPin, Briefcase, Clock, Search } from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
  salary_range: string;
  created_at: string;
  employer: { company_name: string; location: string };
  employment_type: { type_name: string };
}

export default function AdminJobSearch() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ location: "", type: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("title", searchTerm);
      if (filters.location) params.append("location", filters.location);
      if (filters.type) params.append("type", filters.type);
      params.append("page", currentPage.toString());
      params.append("limit", "6");
      const res = await api.get(`/admin/jobs?${params.toString()}`);
      // Handle both paginated and non-paginated responses
      if (res.data.data) {
        setJobs(res.data.data);
        setTotalPages(res.data.pagination?.pages || 1);
      } else {
        setJobs(res.data);
        setTotalPages(1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchTerm, filters, currentPage]);

  return (
    <div className="flex gap-6">
      {/* Right Sidebar Filters */}
      <div className="w-64 shrink-0">
        <div className="bg-white p-4 rounded shadow sticky top-24">
          <h3 className="font-bold mb-3">Filter</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) =>
                setFilters({ ...filters, location: e.target.value })
              }
              className="w-full border rounded p-2 text-sm"
            />
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full border rounded p-2 text-sm"
            >
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Job Listings */}
      <div className="flex-1">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            Showing {jobs.length} Job Results
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search something here..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-md w-64"
            />
          </div>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="bg-white p-8 rounded shadow text-center text-gray-500">
            No jobs found.
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white p-4 rounded shadow">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{job.title}</h3>
                    <p className="text-gray-600">{job.employer.company_name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {job.salary_range}
                    </p>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {job.description}
                    </p>
                  </div>
                  <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full h-fit">
                    {job.employment_type.type_name}
                  </span>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-gray-400">
                  <span>
                    <MapPin className="inline h-3 w-3" />{" "}
                    {job.employer.location}
                  </span>
                  <span>
                    <Briefcase className="inline h-3 w-3" />{" "}
                    {job.employment_type.type_name}
                  </span>
                  <span>
                    <Clock className="inline h-3 w-3" />{" "}
                    {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`px-3 py-1 rounded ${p === currentPage ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
