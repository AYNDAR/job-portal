import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  MapPin,
  Briefcase,
  ChevronRight,
  Star,
  ArrowRight,
  Building2,
  Users,
  CheckCircle,
  Zap,
  Globe,
  Shield,
  Clock,
  Bookmark,
  BookmarkCheck,
  Menu,
  X,
  ChevronDown,
  Bell,
  LogOut,
  User,
  FileText,
  LayoutDashboard,
  PlusCircle,
  TrendingUp,
  Heart,
  Settings,
} from "lucide-react";
import { RootState, AppDispatch } from "../store";
import { searchJobs, bookmarkJob } from "../features/jobSeeker/jobSeekerSlice";

// ─── Types ───────────────────────────────────────────────────
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  employmentType: string;
  salaryRange?: string;
  industry?: string;
}

interface Bookmark {
  jobId: string;
}

// ─── Static data ───────────────────────────────────────────
const CATEGORIES = [
  { label: "Technology", icon: "💻", count: 1240, slug: "technology" },
  { label: "Healthcare", icon: "🏥", count: 856, slug: "healthcare" },
  { label: "Finance", icon: "📊", count: 634, slug: "finance" },
  { label: "Design", icon: "🎨", count: 520, slug: "design" },
  { label: "Marketing", icon: "📣", count: 448, slug: "marketing" },
  { label: "Education", icon: "📚", count: 390, slug: "education" },
  { label: "Engineering", icon: "⚙️", count: 712, slug: "engineering" },
  { label: "Sales", icon: "🤝", count: 318, slug: "sales" },
];

const FEATURED_COMPANIES = [
  {
    name: "TechCorp",
    industry: "Technology",
    jobs: 24,
    verified: true,
    slug: "techcorp",
    description: "Leading software solutions company",
    location: "Addis Ababa, Ethiopia",
  },
  {
    name: "HealthPlus",
    industry: "Healthcare",
    jobs: 18,
    verified: true,
    slug: "healthplus",
    description: "East Africa's top healthcare provider",
    location: "Nairobi, Kenya",
  },
  {
    name: "FinEdge",
    industry: "Finance",
    jobs: 15,
    verified: true,
    slug: "finedge",
    description: "Innovative fintech & banking services",
    location: "Lagos, Nigeria",
  },
  {
    name: "Designify",
    industry: "Design",
    jobs: 11,
    verified: false,
    slug: "designify",
    description: "Creative digital design studio",
    location: "Cape Town, South Africa",
  },
];

const STATS = [
  { value: "50K+", label: "Active Jobs" },
  { value: "12K+", label: "Companies Hiring" },
  { value: "200K+", label: "Job Seekers" },
  { value: "95%", label: "Placement Rate" },
];

const WHY_US = [
  {
    icon: <Zap size={22} className="text-blue-500" />,
    title: "Fast Matching",
    desc: "AI-powered matching connects you to relevant jobs in seconds.",
  },
  {
    icon: <Shield size={22} className="text-green-500" />,
    title: "Verified Employers",
    desc: "Every employer on our platform is verified and trusted.",
  },
  {
    icon: <Globe size={22} className="text-violet-500" />,
    title: "Remote & Hybrid",
    desc: "Find remote, hybrid, or on-site roles across East Africa and beyond.",
  },
  {
    icon: <Clock size={22} className="text-amber-500" />,
    title: "Real-time Updates",
    desc: "Get notified instantly when new matching jobs are posted.",
  },
];

const POPULAR_SEARCHES = [
  {
    label: "React Developer",
    keyword: "React Developer",
    industry: "Technology",
  },
  { label: "Product Manager", keyword: "Product Manager", industry: "" },
  { label: "UX Designer", keyword: "UX Designer", industry: "Design" },
  { label: "Data Analyst", keyword: "Data Analyst", industry: "Technology" },
  {
    label: "DevOps Engineer",
    keyword: "DevOps Engineer",
    industry: "Technology",
  },
];

// ─── Navbar ────────────────────────────────────────────────
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [jobsDropdown, setJobsDropdown] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const isEmployer = user?.userType === "Employer";
  const isSeeker = user?.userType === "Job Seeker";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setJobsDropdown(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase size={15} className="text-white" />
            </div>
            <span
              className={`font-bold text-lg transition-colors ${
                scrolled ? "text-gray-900" : "text-white"
              }`}
            >
              JobPortal
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Browse Jobs Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setJobsDropdown(!jobsDropdown)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  scrolled
                    ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                Browse Jobs{" "}
                <ChevronDown
                  size={14}
                  className={`transition-transform ${jobsDropdown ? "rotate-180" : ""}`}
                />
              </button>
              {jobsDropdown && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-3 py-1.5">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                      By Category
                    </p>
                  </div>
                  {CATEGORIES.slice(0, 5).map((cat) => (
                    <Link
                      key={cat.label}
                      to={`/jobs?industry=${cat.label}`}
                      onClick={() => setJobsDropdown(false)}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-base">{cat.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {cat.label}
                        </p>
                        <p className="text-xs text-gray-400">
                          {cat.count.toLocaleString()} jobs
                        </p>
                      </div>
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <Link
                      to="/jobs"
                      onClick={() => setJobsDropdown(false)}
                      className="flex items-center justify-between px-3 py-2 hover:bg-blue-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-blue-600">
                        View all categories
                      </span>
                      <ArrowRight size={13} className="text-blue-500" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/jobs"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                scrolled
                  ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              Find Jobs
            </Link>

            <Link
              to="/companies"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                scrolled
                  ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              Companies
            </Link>

            {isEmployer && (
              <Link
                to="/employer/dashboard/post"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  scrolled
                    ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                Post a Job
              </Link>
            )}

            <Link
              to="/career-tips"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                scrolled
                  ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              Career Tips
            </Link>
          </div>

          {/* Right Side */}
          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <>
                {/* Notifications */}
                <button
                  className={`relative p-2 rounded-lg transition-colors ${
                    scrolled
                      ? "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Bell size={18} />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                </button>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileDropdown(!profileDropdown)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="text-sm font-medium text-gray-800 max-w-25 truncate">
                      {user.name || "Account"}
                    </span>
                    <ChevronDown
                      size={13}
                      className={`text-gray-400 transition-transform ${profileDropdown ? "rotate-180" : ""}`}
                    />
                  </button>

                  {profileDropdown && (
                    <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {user.email}
                        </p>
                        <span className="mt-1 inline-block text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                          {user.userType}
                        </span>
                      </div>

                      {isSeeker && (
                        <>
                          <Link
                            to="/dashboard"
                            onClick={() => setProfileDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <LayoutDashboard
                              size={15}
                              className="text-gray-400"
                            />{" "}
                            Dashboard
                          </Link>
                          <Link
                            to="/dashboard/applications"
                            onClick={() => setProfileDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <FileText size={15} className="text-gray-400" /> My
                            Applications
                          </Link>
                          <Link
                            to="/dashboard/saved"
                            onClick={() => setProfileDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Heart size={15} className="text-gray-400" /> Saved
                            Jobs
                          </Link>
                          <Link
                            to="/profile"
                            onClick={() => setProfileDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <User size={15} className="text-gray-400" /> My
                            Profile
                          </Link>
                        </>
                      )}

                      {isEmployer && (
                        <>
                          <Link
                            to="/employer/dashboard"
                            onClick={() => setProfileDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <LayoutDashboard
                              size={15}
                              className="text-gray-400"
                            />{" "}
                            Employer Dashboard
                          </Link>
                          <Link
                            to="/employer/dashboard/post"
                            onClick={() => setProfileDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <PlusCircle size={15} className="text-gray-400" />{" "}
                            Post a Job
                          </Link>
                          <Link
                            to="/employer/dashboard/applicants"
                            onClick={() => setProfileDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <TrendingUp size={15} className="text-gray-400" />{" "}
                            Manage Applicants
                          </Link>
                        </>
                      )}

                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <Link
                          to="/settings"
                          onClick={() => setProfileDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Settings size={15} className="text-gray-400" />{" "}
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    scrolled
                      ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              scrolled
                ? "text-gray-700 hover:bg-gray-100"
                : "text-white hover:bg-white/10"
            }`}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            <Link
              to="/jobs"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Search size={16} className="text-gray-400" /> Find Jobs
            </Link>
            <Link
              to="/companies"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Building2 size={16} className="text-gray-400" /> Companies
            </Link>
            <Link
              to="/career-tips"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <TrendingUp size={16} className="text-gray-400" /> Career Tips
            </Link>

            <div className="pt-1 pb-1 border-t border-gray-100">
              <p className="px-3 py-1.5 text-xs text-gray-400 font-medium uppercase tracking-wide">
                Categories
              </p>
              {CATEGORIES.slice(0, 4).map((cat) => (
                <Link
                  key={cat.label}
                  to={`/jobs?industry=${cat.label}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  <span>{cat.icon}</span> {cat.label}
                  <span className="ml-auto text-xs text-gray-400">
                    {cat.count.toLocaleString()}
                  </span>
                </Link>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-100 space-y-2">
              {user ? (
                <>
                  {isSeeker && (
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      My Dashboard
                    </Link>
                  )}
                  {isEmployer && (
                    <Link
                      to="/employer/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Employer Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Job Card ─────────────────────────────────────────────
function JobCard({
  job,
  isBookmarked,
  onBookmark,
}: {
  job: Job;
  isBookmarked: boolean;
  onBookmark: () => void;
}) {
  const daysAgo = Math.floor(Math.random() * 14) + 1;
  const industryIcon =
    job.industry === "Technology"
      ? "💻"
      : job.industry === "Healthcare"
        ? "🏥"
        : job.industry === "Finance"
          ? "📊"
          : job.industry === "Design"
            ? "🎨"
            : job.industry === "Marketing"
              ? "📣"
              : job.industry === "Engineering"
                ? "⚙️"
                : "🏢";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="w-11 h-11 bg-linear-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center shrink-0 text-lg">
          {industryIcon}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            onBookmark();
          }}
          className={`p-1.5 rounded-lg transition shrink-0 ${
            isBookmarked
              ? "text-blue-600 bg-blue-50"
              : "text-gray-300 hover:text-blue-500 hover:bg-blue-50"
          }`}
          title={isBookmarked ? "Remove bookmark" : "Save job"}
        >
          {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>
      </div>

      <Link to={`/jobs/${job.id}`} className="block flex-1">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition text-sm leading-snug mb-1">
          {job.title}
        </h3>
        <p className="text-xs text-gray-500 mb-3">{job.company}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
            <MapPin size={10} /> {job.location}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
            <Briefcase size={10} /> {job.employmentType}
          </span>
        </div>
      </Link>

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <span className="text-sm font-semibold text-gray-800">
          {job.salaryRange || "Competitive"}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{daysAgo}d ago</span>
          <Link
            to={`/jobs/${job.id}`}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5 hover:gap-1.5 transition-all"
          >
            View <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────
export default function HomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { jobs, loading, bookmarks } = useSelector(
    (s: RootState) =>
      s.jobSeeker || {
        jobs: [] as Job[],
        loading: false,
        bookmarks: [] as Bookmark[],
      },
  );

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    dispatch(searchJobs({}));
  }, [dispatch]);

  const handleSearch = (
    e?: React.FormEvent,
    overrideKeyword?: string,
    overrideIndustry?: string,
  ) => {
    e?.preventDefault();
    const kw = overrideKeyword ?? keyword;
    const ind = overrideIndustry ?? activeCategory;
    dispatch(searchJobs({ keyword: kw, location, industry: ind }));
    navigate(
      `/jobs?q=${encodeURIComponent(kw)}&location=${encodeURIComponent(location)}&industry=${encodeURIComponent(ind)}`,
    );
  };

  const isBookmarked = (id: string) =>
    bookmarks.some((b: Bookmark) => b.jobId === id);

  const handleBookmark = (id: string) => {
    if (!user || user.userType !== "Job Seeker") {
      navigate("/login");
      return;
    }
    dispatch(bookmarkJob(id));
  };

  const handleCategoryClick = (cat: (typeof CATEGORIES)[0]) => {
    setActiveCategory(cat.label);
    dispatch(searchJobs({ industry: cat.label }));
    navigate(`/jobs?industry=${encodeURIComponent(cat.label)}`);
  };

  const handleCompanyClick = (company: (typeof FEATURED_COMPANIES)[0]) => {
    navigate(`/jobs?company=${encodeURIComponent(company.name)}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── NAVBAR ───────────────────────────────────────── */}
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative bg-linear-to-br from-[#0d1a2d] via-[#0f2744] to-[#143057] overflow-hidden pt-16">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #6366f1 0%, transparent 40%)",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
            <Zap size={12} className="text-yellow-400" /> 2,400+ new jobs posted
            this week across East Africa
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5">
            Find your next great{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-400">
              opportunity
            </span>
          </h1>
          <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto leading-relaxed">
            Connect with top employers across Ethiopia, Kenya, Nigeria and
            beyond. 50,000+ positions across every industry.
          </p>

          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-2 bg-white rounded-2xl p-2 shadow-2xl max-w-2xl mx-auto mb-6"
          >
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Job title, keywords..."
                className="w-full pl-10 pr-4 py-3 text-sm text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-400"
              />
            </div>
            <div className="hidden md:block w-px bg-gray-200 self-stretch my-1" />
            <div className="relative md:w-44">
              <MapPin
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or Country"
                className="w-full pl-10 pr-4 py-3 text-sm text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-400"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition shadow-sm text-sm"
            >
              Search Jobs
            </button>
          </form>

          {/* Popular Searches — real navigation */}
          <div className="flex items-center justify-center flex-wrap gap-2">
            <span className="text-white/50 text-xs">Popular:</span>
            {POPULAR_SEARCHES.map((s) => (
              <button
                key={s.label}
                onClick={() => {
                  setKeyword(s.keyword);
                  setActiveCategory(s.industry);
                  handleSearch(undefined, s.keyword, s.industry);
                }}
                className="text-xs text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-full transition"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 28C840 36 960 42 1080 40C1200 38 1320 30 1380 26L1440 22V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* STATS */}
      <section className="py-10 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-blue-600">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JOB CATEGORIES — fully functional */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Browse by Category
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Find opportunities in your field
              </p>
            </div>
            <Link
              to="/jobs"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View all jobs <ChevronRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => handleCategoryClick(cat)}
                className={`flex items-center gap-3 p-4 rounded-2xl border text-left hover:border-blue-300 hover:bg-blue-50 transition-all group ${
                  activeCategory === cat.label
                    ? "border-blue-400 bg-blue-50 shadow-sm"
                    : "border-gray-200 bg-white"
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {cat.label}
                  </p>
                  <p className="text-xs text-gray-400">
                    {cat.count.toLocaleString()} jobs
                  </p>
                </div>
                <ChevronRight
                  size={13}
                  className="ml-auto text-gray-300 group-hover:text-blue-400 shrink-0 transition-colors"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED JOBS — real, with full detail navigation */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Featured Jobs
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Hand-picked opportunities for you
              </p>
            </div>
            <Link
              to="/jobs"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              See all <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 animate-pulse"
                >
                  <div className="flex gap-3">
                    <div className="w-11 h-11 bg-gray-100 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20">
              <Briefcase size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium">No jobs found</p>
              <p className="text-gray-400 text-sm mt-1">
                Try different keywords or filters
              </p>
              <Link
                to="/jobs"
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Browse all jobs <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.slice(0, 6).map((job: Job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isBookmarked={isBookmarked(job.id)}
                  onBookmark={() => handleBookmark(job.id)}
                />
              ))}
            </div>
          )}

          {jobs.length > 0 && (
            <div className="text-center mt-10">
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition shadow-sm text-sm"
              >
                Explore All Jobs <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* WHY JOBPORTAL */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900">Why JobPortal?</h2>
            <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
              We make the job search experience simple, fast, and transparent
              across East Africa.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY_US.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED COMPANIES — functional, navigate to filtered jobs */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Top Hiring Companies
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Trusted employers actively looking for talent
              </p>
            </div>
            <Link
              to="/companies"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View all <ChevronRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {FEATURED_COMPANIES.map((co) => (
              <button
                key={co.name}
                onClick={() => handleCompanyClick(co)}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-md transition-all text-center group"
              >
                <div className="w-14 h-14 bg-linear-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center text-xl font-bold text-blue-600 mx-auto mb-3 group-hover:scale-105 transition-transform">
                  {co.name[0]}
                </div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {co.name}
                  </p>
                  {co.verified && (
                    <CheckCircle size={13} className="text-blue-500" />
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-1">{co.industry}</p>
                <p className="text-xs text-gray-400 mb-3">{co.location}</p>
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full font-medium">
                  {co.jobs} open roles
                </span>
                <p className="text-xs text-blue-500 mt-2 flex items-center justify-center gap-0.5 group-hover:gap-1.5 transition-all">
                  View jobs <ArrowRight size={11} />
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SPLIT BANNER — fixed: always shows login/register links */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Job Seeker Card */}
            <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <Users size={28} className="mb-4 text-blue-200" />
              <h3 className="text-xl font-bold mb-2">Find Your Dream Job</h3>
              <p className="text-blue-100 text-sm mb-5 leading-relaxed">
                Create a profile, upload your resume, and get discovered by top
                employers today.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  to="/register?type=seeker"
                  className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition"
                >
                  Create Account <ArrowRight size={14} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 bg-blue-500/40 hover:bg-blue-500/60 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition border border-white/20"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* Employer Card */}
            <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <Building2 size={28} className="mb-4 text-gray-300" />
              <h3 className="text-xl font-bold mb-2">Hire Top Talent</h3>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                Post jobs, review applications, and find the perfect candidate
                faster than ever.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  to="/register?type=employer"
                  className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-gray-100 transition"
                >
                  Start Hiring <ArrowRight size={14} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition border border-white/20"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Success Stories
          </h2>
          <p className="text-gray-500 text-sm mb-10">
            Thousands of professionals found their next role with us
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name: "Sara Abebe",
                role: "Frontend Engineer at TechCorp",
                location: "Addis Ababa, Ethiopia",
                quote:
                  "I landed my dream job in just 3 weeks. The platform made it so easy to connect with the right employers.",
                rating: 5,
              },
              {
                name: "Daniel Tesfaye",
                role: "Product Manager at StartupX",
                location: "Nairobi, Kenya",
                quote:
                  "The job recommendations were spot on. I didn't waste time scrolling through irrelevant listings.",
                rating: 5,
              },
              {
                name: "Meron Girma",
                role: "UX Designer at Designify",
                location: "Lagos, Nigeria",
                quote:
                  "Best job portal I've used. The profile feature helped me showcase my portfolio and get noticed.",
                rating: 5,
              },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-gray-50 rounded-2xl border border-gray-100 p-5 text-left"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      className="text-amber-400"
                      fill="currentColor"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">
                      {t.name}
                    </p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                    <p className="text-xs text-gray-300">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0d1a2d] text-gray-400 py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Briefcase size={15} className="text-white" />
                </div>
                <span className="text-white font-bold text-base">
                  JobPortal
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Connecting talented professionals with great opportunities
                across East Africa and beyond.
              </p>
            </div>
            {[
              {
                title: "For Job Seekers",
                links: [
                  { label: "Browse Jobs", to: "/jobs" },
                  { label: "My Dashboard", to: "/dashboard" },
                  { label: "My Applications", to: "/dashboard/applications" },
                  { label: "Saved Jobs", to: "/dashboard/saved" },
                  { label: "Career Tips", to: "/career-tips" },
                ],
              },
              {
                title: "For Employers",
                links: [
                  { label: "Post a Job", to: "/register?type=employer" },
                  { label: "Employer Dashboard", to: "/employer/dashboard" },
                  {
                    label: "Manage Applicants",
                    to: "/employer/dashboard/applicants",
                  },
                  { label: "Company Profile", to: "/employer/profile" },
                  {
                    label: "Sign Up as Employer",
                    to: "/register?type=employer",
                  },
                ],
              },
              {
                title: "Company",
                links: [
                  { label: "About Us", to: "/about" },
                  { label: "Blog", to: "/blog" },
                  { label: "Careers", to: "/jobs" },
                  { label: "Privacy Policy", to: "/privacy" },
                  { label: "Terms of Service", to: "/terms" },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-white font-semibold text-sm mb-3">
                  {col.title}
                </p>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-xs hover:text-white transition"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs">
              © {new Date().getFullYear()} JobPortal. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <Link to="/privacy" className="hover:text-white transition">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-white transition">
                Terms
              </Link>
              <Link to="/cookies" className="hover:text-white transition">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
