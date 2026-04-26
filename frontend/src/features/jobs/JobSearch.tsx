import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { searchJobs, setPage } from "../../store/jobsSlice";
import {
  fetchBookmarks,
  addBookmark,
  removeBookmark,
} from "../../store/bookmarksSlice";
import JobSearchBar from "../../components/jobs/JobSearchBar";
import JobFilters from "../../components/jobs/JobFilters";
import JobCard from "../../components/jobs/JobCard";
import Pagination from "../../components/common/Pagination";
import Loader from "../../components/common/Loader";
import { Link } from "react-router-dom";
import { Briefcase, Users, BarChart, TrendingUp } from "lucide-react";

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
  });

  // Fetch jobs when filters or page change
  useEffect(() => {
    if (token) {
      dispatch(searchJobs({ ...filters, page: currentPage }));
    }
  }, [dispatch, token, filters, currentPage]);

  // Fetch bookmarks if user is a job seeker
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

  // Static data for popular categories (you can later fetch from backend)
  const popularCategories = [
    {
      name: "Software Development",
      count: 1235,
      icon: <Briefcase className="h-8 w-8 text-blue-600" />,
    },
    {
      name: "Marketing",
      count: 870,
      icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
    },
    {
      name: "Sales",
      count: 654,
      icon: <BarChart className="h-8 w-8 text-blue-600" />,
    },
    {
      name: "Customer Support",
      count: 432,
      icon: <Users className="h-8 w-8 text-blue-600" />,
    },
  ];

  // Show only first 5 jobs in "Recent Jobs" section (if no search filters are active)
  const recentJobs =
    filters.title ||
    filters.location ||
    filters.industry ||
    filters.type ||
    filters.salary
      ? items
      : items.slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section with Search */}
      <JobSearchBar
        title={filters.title}
        location={filters.location}
        onTitleChange={(value) => handleFilterChange("title", value)}
        onLocationChange={(value) => handleFilterChange("location", value)}
        onSearch={handleSearch}
      />

      {/* Popular Job Categories */}
      <section className="my-12">
        <h2 className="text-2xl font-bold text-center mb-8">
          Popular Job Categories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularCategories.map((cat) => (
            <div
              key={cat.name}
              className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition"
            >
              <div className="flex justify-center mb-3">{cat.icon}</div>
              <h3 className="text-lg font-semibold">{cat.name}</h3>
              <p className="text-gray-500">{cat.count} jobs</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content: Filters + Jobs */}
      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        <aside className="lg:w-1/4">
          <JobFilters filters={filters} onFilterChange={handleFilterChange} />
        </aside>
        <main className="lg:w-3/4">
          {/* Recent Jobs Heading */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Recent Jobs</h2>
            {items.length > 5 && !(filters.title || filters.location) && (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="text-blue-600 hover:underline"
              >
                Browse All &rarr;
              </button>
            )}
          </div>

          {isLoading ? (
            <Loader />
          ) : recentJobs.length === 0 ? (
            <div className="bg-white p-8 rounded-lg border text-center text-gray-500">
              No jobs found. Try adjusting your filters.
            </div>
          ) : (
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  companyName={job.employer.company_name}
                  location={job.employer.location}
                  employmentType={job.employment_type.type_name}
                  salaryRange={job.salary_range}
                  postedAt={new Date(job.created_at).toLocaleDateString()}
                  isBookmarked={isBookmarked(job.id)}
                  onBookmark={handleBookmark}
                  showBookmark={user?.userType === "Job Seeker"}
                />
              ))}
            </div>
          )}

          {/* Pagination (only if more than 5 jobs and no active filters) */}
          {totalPages > 1 && !(filters.title || filters.location) && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => dispatch(setPage(page))}
            />
          )}
        </main>
      </div>

      {/* Callout Cards for Job Seekers & Employers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="bg-blue-50 p-6 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-bold mb-2">For Job Seekers</h3>
          <p className="text-gray-600 mb-4">
            Create an account, search jobs, and apply to your dream job.
          </p>
          <Link
            to="/register"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Get Started
          </Link>
        </div>
        <div className="bg-green-50 p-6 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-bold mb-2">For Employers</h3>
          <p className="text-gray-600 mb-4">
            Post jobs, manage applicants, and find the best talent.
          </p>
          <Link
            to="/register"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Post a Job
          </Link>
        </div>
      </div>
    </div>
  );
}
