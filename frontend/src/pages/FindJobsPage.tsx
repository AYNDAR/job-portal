import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import api from "../services/api";
import {
  Search,
  MapPin,
  Briefcase,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  DollarSign,
  SlidersHorizontal,
  LayoutGrid,
  List,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────
interface Job {
  id: string;
  title: string;
  description: string;
  salary_range: string;
  created_at: string;
  employer: {
    company_name: string;
    logo_url: string | null;
    location: string;
  };
  employment_type: { type_name: string };
  industry: { industry_name: string };
}

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Design",
  "Marketing",
  "Education",
  "Engineering",
  "Sales",
  "Legal",
  "Human Resources",
];

const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Remote",
  "Hybrid",
];

const SALARY_RANGES = [
  { label: "Any salary", value: "" },
  { label: "Under $30K", value: "0-30000" },
  { label: "$30K – $60K", value: "30000-60000" },
  { label: "$60K – $100K", value: "60000-100000" },
  { label: "$100K – $150K", value: "100000-150000" },
  { label: "$150K+", value: "150000+" },
];

const SORT_OPTIONS = [
  { label: "Most Recent", value: "recent" },
  { label: "Salary: High to Low", value: "salary_desc" },
  { label: "Salary: Low to High", value: "salary_asc" },
  { label: "Most Relevant", value: "relevant" },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function industryIcon(industry: string) {
  const map: Record<string, string> = {
    Technology: "💻",
    Healthcare: "🏥",
    Finance: "📊",
    Design: "🎨",
    Marketing: "📣",
    Education: "📚",
    Engineering: "⚙️",
    Sales: "🤝",
    Legal: "⚖️",
    "Human Resources": "👥",
  };
  return map[industry] || "🏢";
}

// ─── Job Card (Grid) ─────────────────────────────────────────
function JobCardGrid({
  job,
  saved,
  onSave,
}: {
  job: Job;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group p-5 flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="w-11 h-11 rounded-xl bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-xl shrink-0">
          {industryIcon(job.industry.industry_name)}
        </div>
        <button
          onClick={onSave}
          className={`p-1.5 rounded-lg transition shrink-0 ${
            saved
              ? "text-blue-600 bg-blue-50"
              : "text-gray-300 hover:text-blue-500 hover:bg-blue-50"
          }`}
        >
          {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>
      </div>

      <Link to={`/jobs/${job.id}`} className="flex-1">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition text-sm leading-snug mb-1">
          {job.title}
        </h3>
        <p className="text-xs text-gray-500 mb-3">
          {job.employer.company_name}
        </p>
        <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
          {job.description?.replace(/<[^>]*>/g, "").slice(0, 100)}...
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
            <MapPin size={10} /> {job.employer.location}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
            <Briefcase size={10} /> {job.employment_type.type_name}
          </span>
        </div>
      </Link>

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <span className="text-sm font-semibold text-gray-800">
          {job.salary_range || "Competitive"}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {timeAgo(job.created_at)}
          </span>
          <Link
            to={`/jobs/${job.id}`}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5 hover:gap-1.5 transition-all"
          >
            Apply <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Job Card (List) ─────────────────────────────────────────
function JobCardList({
  job,
  saved,
  onSave,
}: {
  job: Job;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group px-5 py-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-2xl shrink-0">
        {industryIcon(job.industry.industry_name)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={`/jobs/${job.id}`}>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition text-sm truncate">
                {job.title}
              </h3>
            </Link>
            <p className="text-xs text-gray-500">{job.employer.company_name}</p>
          </div>
          <span className="text-xs text-gray-400 shrink-0">
            {timeAgo(job.created_at)}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-lg">
            <MapPin size={9} /> {job.employer.location}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
            <Briefcase size={9} /> {job.employment_type.type_name}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">
            <DollarSign size={9} /> {job.salary_range || "Competitive"}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-lg">
            {job.industry.industry_name}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onSave}
          className={`p-1.5 rounded-lg transition ${
            saved
              ? "text-blue-600 bg-blue-50"
              : "text-gray-300 hover:text-blue-500 hover:bg-blue-50"
          }`}
        >
          {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
        </button>
        <Link
          to={`/jobs/${job.id}`}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
        >
          View Job
        </Link>
      </div>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 animate-pulse">
      <div className="flex gap-3">
        <div className="w-11 h-11 bg-gray-100 rounded-xl" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 bg-gray-100 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
      <div className="flex gap-2">
        <div className="h-6 bg-gray-100 rounded-lg w-20" />
        <div className="h-6 bg-gray-100 rounded-lg w-16" />
      </div>
      <div className="h-px bg-gray-50" />
      <div className="flex justify-between">
        <div className="h-4 bg-gray-100 rounded w-20" />
        <div className="h-4 bg-gray-100 rounded w-12" />
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function FindJobsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token } = useAppSelector((state) => state.auth);

  // Search state — read from URL on mount
  const [keyword, setKeyword] = useState(searchParams.get("q") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(
    searchParams.get("industry") ? [searchParams.get("industry")!] : [],
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [salaryRange, setSalaryRange] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);
  const [page, setPage] = useState(1);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const JOBS_PER_PAGE = 9;

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (keyword) params.keyword = keyword;
      if (location) params.location = location;
      if (selectedIndustries.length)
        params.industry = selectedIndustries.join(",");
      if (selectedTypes.length) params.employmentType = selectedTypes.join(",");
      if (salaryRange) params.salaryRange = salaryRange;
      params.sort = sortBy;
      params.page = String(page);
      params.limit = String(JOBS_PER_PAGE);

      const res = await api.get("/jobs", { params });
      // Support both { jobs, total } and plain array responses
      if (Array.isArray(res.data)) {
        setJobs(res.data);
        setTotalJobs(res.data.length);
      } else {
        setJobs(res.data.jobs || res.data.data || []);
        setTotalJobs(res.data.total || res.data.count || 0);
      }
    } catch {
      setJobs([]);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }
  }, [
    keyword,
    location,
    selectedIndustries,
    selectedTypes,
    salaryRange,
    sortBy,
    page,
  ]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setPage(1);
    const params: Record<string, string> = {};
    if (keyword) params.q = keyword;
    if (location) params.location = location;
    if (selectedIndustries[0]) params.industry = selectedIndustries[0];
    setSearchParams(params);
    fetchJobs();
  };

  const toggleIndustry = (ind: string) => {
    setPage(1);
    setSelectedIndustries((prev) =>
      prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind],
    );
  };

  const toggleType = (t: string) => {
    setPage(1);
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((i) => i !== t) : [...prev, t],
    );
  };

  const clearFilters = () => {
    setSelectedIndustries([]);
    setSelectedTypes([]);
    setSalaryRange("");
    setKeyword("");
    setLocation("");
    setPage(1);
    setSearchParams({});
  };

  const toggleSave = (id: string) => {
    if (!token) {
      navigate("/login");
      return;
    }
    setSavedJobs((prev) =>
      prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id],
    );
    // Optionally: api.post(`/jobs/${id}/bookmark`);
  };

  const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);
  const activeFiltersCount =
    selectedIndustries.length + selectedTypes.length + (salaryRange ? 1 : 0);

  // ─── Sidebar ───────────────────────────────────────────────
  const Sidebar = () => (
    <aside className="w-full space-y-6">
      {/* Industry */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Industry</h3>
        <div className="space-y-2">
          {INDUSTRIES.map((ind) => (
            <label
              key={ind}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedIndustries.includes(ind)}
                onChange={() => toggleIndustry(ind)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition">
                {ind}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Employment Type */}
      <div className="border-t border-gray-100 pt-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Employment Type
        </h3>
        <div className="space-y-2">
          {EMPLOYMENT_TYPES.map((t) => (
            <label
              key={t}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedTypes.includes(t)}
                onChange={() => toggleType(t)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition">
                {t}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div className="border-t border-gray-100 pt-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Salary Range
        </h3>
        <div className="space-y-2">
          {SALARY_RANGES.map((r) => (
            <label
              key={r.value}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="radio"
                name="salary"
                value={r.value}
                checked={salaryRange === r.value}
                onChange={() => {
                  setSalaryRange(r.value);
                  setPage(1);
                }}
                className="w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition">
                {r.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <button
          onClick={clearFilters}
          className="w-full flex items-center justify-center gap-1.5 text-sm text-red-500 hover:text-red-700 border border-red-100 hover:border-red-200 bg-red-50 hover:bg-red-100 rounded-xl py-2.5 transition"
        >
          <X size={14} /> Clear all filters
        </button>
      )}
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* ── Search Header ──────────────────────────────── */}
      <div className="bg-linear-to-br from-[#0d1a2d] via-[#0f2744] to-[#143057] py-10">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Find Your Next Job
          </h1>
          <p className="text-white/60 text-sm mb-6">
            {totalJobs > 0
              ? `${totalJobs.toLocaleString()} jobs available`
              : "Search across thousands of opportunities"}
          </p>

          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-2 bg-white rounded-2xl p-2 shadow-xl"
          >
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Job title, skills, keywords..."
                className="w-full pl-10 pr-4 py-3 text-sm text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-400"
              />
            </div>
            <div className="hidden md:block w-px bg-gray-200 self-stretch my-1" />
            <div className="relative md:w-48">
              <MapPin
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or country"
                className="w-full pl-10 pr-4 py-3 text-sm text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-400"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition text-sm"
            >
              Search
            </button>
          </form>

          {/* Active filter tags */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedIndustries.map((ind) => (
                <span
                  key={ind}
                  className="inline-flex items-center gap-1.5 text-xs bg-white/20 text-white px-3 py-1 rounded-full"
                >
                  {ind}
                  <button onClick={() => toggleIndustry(ind)}>
                    <X size={11} />
                  </button>
                </span>
              ))}
              {selectedTypes.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 text-xs bg-white/20 text-white px-3 py-1 rounded-full"
                >
                  {t}
                  <button onClick={() => toggleType(t)}>
                    <X size={11} />
                  </button>
                </span>
              ))}
              {salaryRange && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-white/20 text-white px-3 py-1 rounded-full">
                  {SALARY_RANGES.find((r) => r.value === salaryRange)?.label}
                  <button onClick={() => setSalaryRange("")}>
                    <X size={11} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-7">
          {/* Sidebar — desktop */}
          <div className="hidden lg:block w-56 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <Filter size={15} className="text-gray-500" />
                  <span className="text-sm font-semibold text-gray-900">
                    Filters
                  </span>
                  {activeFiltersCount > 0 && (
                    <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
              </div>
              <Sidebar />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 text-sm text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition"
                >
                  <SlidersHorizontal size={15} />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
                <p className="text-sm text-gray-500">
                  {loading
                    ? "Loading..."
                    : `${totalJobs.toLocaleString()} jobs found`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 transition ${viewMode === "grid" ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 transition ${viewMode === "list" ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Job cards */}
            {loading ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                    : "space-y-3"
                }
              >
                {Array.from({ length: 6 }).map((_, i) =>
                  viewMode === "grid" ? (
                    <SkeletonGrid key={i} />
                  ) : (
                    <div
                      key={i}
                      className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse flex gap-4"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-100 rounded w-1/2" />
                        <div className="h-3 bg-gray-100 rounded w-1/3" />
                        <div className="flex gap-2">
                          <div className="h-5 bg-gray-100 rounded-lg w-20" />
                          <div className="h-5 bg-gray-100 rounded-lg w-16" />
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <Briefcase size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-600 font-semibold">No jobs found</p>
                <p className="text-gray-400 text-sm mt-1 mb-5">
                  Try different keywords, location, or filters
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <X size={14} /> Clear all filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {jobs.map((job) => (
                  <JobCardGrid
                    key={job.id}
                    job={job}
                    saved={savedJobs.includes(job.id)}
                    onSave={() => toggleSave(job.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <JobCardList
                    key={job.id}
                    job={job}
                    saved={savedJobs.includes(job.id)}
                    onSave={() => toggleSave(job.id)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} className="text-gray-600" />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition ${
                        page === p
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                {totalPages > 7 && (
                  <span className="text-gray-400 text-sm">...</span>
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={16} className="text-gray-600" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-5">
              <span className="font-semibold text-gray-900">Filters</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <Sidebar />
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition text-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
