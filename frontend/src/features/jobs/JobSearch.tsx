import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  MapPin,
  Building,
  Briefcase,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Filter,
} from "lucide-react";
import { RootState, AppDispatch } from "../../store";
import { searchJobs, bookmarkJob } from "../jobSeeker/jobSeekerSlice";
import Loader from "../../components/common/Loader";

export default function JobSearch() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    jobs = [],
    loading = false,
    bookmarks = [],
  } = useSelector(
    (state: RootState) =>
      state.jobSeeker || { jobs: [], loading: false, bookmarks: [] },
  );
  const [filters, setFilters] = useState({ title: "", location: "" });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(searchJobs(filters));
  }, [dispatch, filters]);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const isBookmarked = (jobId: string) =>
    bookmarks.some((b) => b.jobId === jobId);

  const handleBookmark = (jobId: string) => {
    if (!user || user.userType !== "Job Seeker") {
      alert("Please login as a job seeker to bookmark jobs.");
      return;
    }
    dispatch(bookmarkJob(jobId));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(searchJobs(filters));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">
        Find Your Dream Job
      </h1>
      <form
        onSubmit={handleSearch}
        className="flex flex-col md:flex-row gap-3 bg-white rounded-lg shadow-md p-2 mb-4"
      >
        <input
          type="text"
          placeholder="Job title"
          value={filters.title}
          onChange={(e) => handleFilterChange("title", e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Location"
          value={filters.location}
          onChange={(e) => handleFilterChange("location", e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          Search
        </button>
      </form>

      {loading ? (
        <Loader />
      ) : jobs.length === 0 ? (
        <div className="text-center p-8">No jobs found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl shadow p-5 border">
              <Link to={`/jobs/${job.id}`}>
                <h3 className="text-xl font-semibold">{job.title}</h3>
                <div className="flex items-center gap-1 text-gray-600 mt-1">
                  <Building size={16} /> {job.company}
                </div>
                <div className="flex gap-3 mt-2 text-sm text-gray-500">
                  <span>
                    <MapPin size={14} className="inline" /> {job.location}
                  </span>
                  <span>
                    <Briefcase size={14} className="inline" />{" "}
                    {job.employmentType}
                  </span>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-green-600 font-semibold">
                    {job.salaryRange}
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleBookmark(job.id);
                    }}
                    className={`text-sm px-3 py-1 rounded-full ${isBookmarked(job.id) ? "bg-yellow-100 text-yellow-700" : "bg-gray-100"}`}
                  >
                    {isBookmarked(job.id) ? "Saved" : "Save"}
                  </button>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
