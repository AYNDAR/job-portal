import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { searchJobs, setPage } from "../../store/jobsSlice";
import {
  fetchBookmarks,
  addBookmark,
  removeBookmark,
} from "../../store/bookmarksSlice";
import Pagination from "../../components/common/Pagination";
import Loader from "../../components/common/Loader";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Building,
  Clock,
  Briefcase,
  Filter,
  TrendingUp,
  Users,
  BarChart,
} from "lucide-react";

export default function JobSearch() {
  const dispatch = useAppDispatch();
  const { items, isLoading, currentPage, totalPages } = useAppSelector(
    (state) => state.jobs,
  );
  const { token, user } = useAppSelector((state) => state.auth);
  const { items: bookmarks } = useAppSelector((state) => state.bookmarks);

  const [filters, setFilters] = useState({
    title: "",
    location: "",
    industry: "",
    type: "",
    salary: "",
    jobSite: "",
    experienceLevel: "",
    educationLevel: "",
    genderPreference: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(searchJobs({ ...filters, page: currentPage }));
  }, [dispatch, filters, currentPage]);

  useEffect(() => {
    if (token && user?.userType === "Job Seeker") {
      dispatch(fetchBookmarks());
    }
  }, [dispatch, token, user]);

  const isBookmarked = (jobId: string) =>
    bookmarks.some((b) => b.job.id === jobId);

  const handleBookmark = (jobId: string) => {
    if (!user || user.userType !== "Job Seeker") {
      alert("Please login as a job seeker to bookmark jobs.");
      return;
    }
    if (isBookmarked(jobId)) {
      dispatch(removeBookmark(jobId));
    } else {
      dispatch(addBookmark(jobId));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(searchJobs({ ...filters, page: 1 }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key !== "page") {
      dispatch(setPage(1));
      dispatch(searchJobs({ ...filters, [key]: value, page: 1 }));
    }
  };

  const resetFilters = () => {
    setFilters({
      title: "",
      location: "",
      industry: "",
      type: "",
      salary: "",
      jobSite: "",
      experienceLevel: "",
      educationLevel: "",
      genderPreference: "",
    });
  };

  const sectors = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Retail",
    "Construction",
  ];
  const jobTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Internship",
    "Temporary",
  ];
  const jobSites = ["Onsite", "Remote", "Hybrid"];
  const experienceLevels = ["Junior", "Mid", "Senior", "Lead"];
  const educationLevels = ["High School", "Bachelor", "Master", "PhD"];
  const genderPreferences = ["Any", "Male", "Female"];

  const popularCategories = [
    {
      name: "Software Development",
      count: 1235,
      icon: <Briefcase className="h-8 w-8 text-blue-600" />,
      color: "bg-blue-50",
    },
    {
      name: "Marketing",
      count: 870,
      icon: <TrendingUp className="h-8 w-8 text-green-600" />,
      color: "bg-green-50",
    },
    {
      name: "Design & Creative",
      count: 623,
      icon: <Users className="h-8 w-8 text-purple-600" />,
      color: "bg-purple-50",
    },
    {
      name: "Data Science",
      count: 412,
      icon: <BarChart className="h-8 w-8 text-yellow-600" />,
      color: "bg-yellow-50",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-6">
          Find Your Dream Job
        </h1>
        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row gap-3 bg-white rounded-lg shadow-md p-2"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Job title, keywords, or company"
              value={filters.title}
              onChange={(e) => handleFilterChange("title", e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="City, state, or remote"
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700"
          >
            Search
          </button>
        </form>
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-blue-600 text-sm flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />{" "}
            {showFilters ? "Hide advanced filters" : "Show advanced filters"}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {showFilters && (
          <aside className="lg:w-1/4 space-y-6 bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Advanced Filters</h3>
              <button onClick={resetFilters} className="text-sm text-red-500">
                Reset all
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sector
              </label>
              <select
                value={filters.industry}
                onChange={(e) => handleFilterChange("industry", e.target.value)}
                className="w-full border rounded p-2 text-sm"
              >
                <option value="">Any</option>
                {sectors.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Job Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="w-full border rounded p-2 text-sm"
              >
                <option value="">Any</option>
                {jobTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Job Site
              </label>
              <select
                value={filters.jobSite}
                onChange={(e) => handleFilterChange("jobSite", e.target.value)}
                className="w-full border rounded p-2 text-sm"
              >
                <option value="">Any</option>
                {jobSites.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Experience Level
              </label>
              <select
                value={filters.experienceLevel}
                onChange={(e) =>
                  handleFilterChange("experienceLevel", e.target.value)
                }
                className="w-full border rounded p-2 text-sm"
              >
                <option value="">Any</option>
                {experienceLevels.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Education Level
              </label>
              <select
                value={filters.educationLevel}
                onChange={(e) =>
                  handleFilterChange("educationLevel", e.target.value)
                }
                className="w-full border rounded p-2 text-sm"
              >
                <option value="">Any</option>
                {educationLevels.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gender Preference
              </label>
              <select
                value={filters.genderPreference}
                onChange={(e) =>
                  handleFilterChange("genderPreference", e.target.value)
                }
                className="w-full border rounded p-2 text-sm"
              >
                <option value="">Any</option>
                {genderPreferences.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Salary Range (e.g., 80k-100k)
              </label>
              <input
                type="text"
                value={filters.salary}
                onChange={(e) => handleFilterChange("salary", e.target.value)}
                className="w-full border rounded p-2 text-sm"
                placeholder="e.g., 80k-100k"
              />
            </div>
          </aside>
        )}

        <main className={showFilters ? "lg:w-3/4" : "w-full"}>
          {/* Popular Job Categories Grid */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-4">
              Popular Job Categories
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Explore thousands of jobs across top categories
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularCategories.map((cat) => (
                <div
                  key={cat.name}
                  className={`${cat.color} p-5 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer flex flex-col items-center text-center`}
                  onClick={() => handleFilterChange("industry", cat.name)}
                >
                  <div className="mb-2">{cat.icon}</div>
                  <h3 className="text-lg font-semibold">{cat.name}</h3>
                  <p className="text-gray-500">{cat.count} jobs</p>
                </div>
              ))}
            </div>
          </div>

          {isLoading ? (
            <Loader />
          ) : items.length === 0 ? (
            <div className="bg-white p-12 rounded-xl text-center text-gray-500 shadow-sm">
              No jobs found. Try adjusting your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md p-5 border"
                >
                  <Link to={`/jobs/${job.id}`} className="block">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1 hover:text-blue-600">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-600 mb-2">
                      <Building className="h-4 w-4" />
                      <span>{job.employer.company_name}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
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
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-green-600 font-semibold">
                        {job.salary_range}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleBookmark(job.id);
                        }}
                        className={`text-sm px-3 py-1 rounded-full ${isBookmarked(job.id) ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}
                      >
                        {isBookmarked(job.id) ? "Saved" : "Save"}
                      </button>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => dispatch(setPage(page))}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
