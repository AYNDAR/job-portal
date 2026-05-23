import { useState, useEffect } from "react";
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
  { label: "Technology", icon: "💻", count: 1240 },
  { label: "Healthcare", icon: "🏥", count: 856 },
  { label: "Finance", icon: "📊", count: 634 },
  { label: "Design", icon: "🎨", count: 520 },
  { label: "Marketing", icon: "📣", count: 448 },
  { label: "Education", icon: "📚", count: 390 },
  { label: "Engineering", icon: "⚙️", count: 712 },
  { label: "Sales", icon: "🤝", count: 318 },
];

const FEATURED_COMPANIES = [
  { name: "TechCorp", industry: "Technology", jobs: 24, verified: true },
  { name: "HealthPlus", industry: "Healthcare", jobs: 18, verified: true },
  { name: "FinEdge", industry: "Finance", jobs: 15, verified: true },
  { name: "Designify", industry: "Design", jobs: 11, verified: false },
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
    desc: "Find remote, hybrid, or on-site roles across the globe.",
  },
  {
    icon: <Clock size={22} className="text-amber-500" />,
    title: "Real-time Updates",
    desc: "Get notified instantly when new matching jobs are posted.",
  },
];

// ─── Sub-components ────────────────────────────────────────
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
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="w-11 h-11 bg-linear-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center shrink-0 text-lg">
          {job.industry === "Technology"
            ? "💻"
            : job.industry === "Healthcare"
              ? "🏥"
              : "🏢"}
        </div>
        <button
          onClick={onBookmark}
          className={`p-1.5 rounded-lg transition shrink-0 ${isBookmarked ? "text-blue-600 bg-blue-50" : "text-gray-300 hover:text-blue-500 hover:bg-blue-50"}`}
        >
          {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>
      </div>
      <Link to={`/jobs/${job.id}`}>
        <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition text-sm leading-snug mb-1">
          {job.title}
        </h3>
      </Link>
      <p className="text-xs text-gray-500 mb-3">{job.company}</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
          <MapPin size={10} /> {job.location}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
          <Briefcase size={10} /> {job.employmentType}
        </span>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <span className="text-sm font-semibold text-gray-800">
          {job.salaryRange || "Competitive"}
        </span>
        <span className="text-xs text-gray-400">{daysAgo}d ago</span>
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

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    dispatch(searchJobs({ keyword, location, industry: activeCategory }));
    navigate(
      `/jobs?q=${keyword}&location=${location}&industry=${activeCategory}`,
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

  const popularSearches = [
    "React Developer",
    "Product Manager",
    "UX Designer",
    "Data Analyst",
    "DevOps Engineer",
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative bg-linear-to-br from-[#0d1a2d] via-[#0f2744] to-[#143057] overflow-hidden">
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
            this week
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5">
            Find your next great{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-400">
              opportunity
            </span>
          </h1>
          <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto leading-relaxed">
            Connect with top companies and land your dream job. 50,000+
            positions across every industry.
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
                placeholder="Location"
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

          <div className="flex items-center justify-center flex-wrap gap-2">
            <span className="text-white/50 text-xs">Popular:</span>
            {popularSearches.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setKeyword(s);
                  handleSearch();
                }}
                className="text-xs text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-full transition"
              >
                {s}
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

      {/* JOB CATEGORIES */}
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
                onClick={() => {
                  setActiveCategory(cat.label);
                  dispatch(searchJobs({ industry: cat.label }));
                  navigate(`/jobs?industry=${cat.label}`);
                }}
                className={`flex items-center gap-3 p-4 rounded-2xl border text-left hover:border-blue-300 hover:bg-blue-50 transition-all group ${
                  activeCategory === cat.label
                    ? "border-blue-400 bg-blue-50"
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
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED JOBS */}
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
        </div>
      </section>

      {/* WHY JOBPORTAL */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900">Why JobPortal?</h2>
            <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
              We make the job search experience simple, fast, and transparent.
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

      {/* FEATURED COMPANIES */}
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
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {FEATURED_COMPANIES.map((co) => (
              <div
                key={co.name}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer text-center"
              >
                <div className="w-14 h-14 bg-linear-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center text-xl font-bold text-blue-600 mx-auto mb-3">
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
                <p className="text-xs text-gray-400 mb-3">{co.industry}</p>
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full font-medium">
                  {co.jobs} open roles
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SPLIT BANNER */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <Users size={28} className="mb-4 text-blue-200" />
              <h3 className="text-xl font-bold mb-2">Find Your Dream Job</h3>
              <p className="text-blue-100 text-sm mb-5 leading-relaxed">
                Create a profile, upload your resume, and get discovered by top
                employers today.
              </p>
              <Link
                to={user ? "/dashboard" : "/register"}
                className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition"
              >
                {user ? "Go to Dashboard" : "Get Started Free"}{" "}
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <Building2 size={28} className="mb-4 text-gray-300" />
              <h3 className="text-xl font-bold mb-2">Hire Top Talent</h3>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                Post jobs, review applications, and find the perfect candidate
                faster than ever.
              </p>
              <Link
                to={
                  user?.userType === "Employer"
                    ? "/employer/dashboard/post"
                    : "/register"
                }
                className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-gray-100 transition"
              >
                Post a Job <ArrowRight size={14} />
              </Link>
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
                quote:
                  "I landed my dream job in just 3 weeks. The platform made it so easy to connect with the right employers.",
                rating: 5,
              },
              {
                name: "Daniel Tesfaye",
                role: "Product Manager at StartupX",
                quote:
                  "The job recommendations were spot on. I didn't waste time scrolling through irrelevant listings.",
                rating: 5,
              },
              {
                name: "Meron Girma",
                role: "UX Designer at Designify",
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
                  "Browse Jobs",
                  "My Dashboard",
                  "Applications",
                  "Saved Jobs",
                  "Career Tips",
                ],
              },
              {
                title: "For Employers",
                links: [
                  "Post a Job",
                  "Employer Dashboard",
                  "Manage Applicants",
                  "Company Profile",
                  "Pricing",
                ],
              },
              {
                title: "Company",
                links: [
                  "About Us",
                  "Blog",
                  "Careers",
                  "Privacy Policy",
                  "Terms of Service",
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-white font-semibold text-sm mb-3">
                  {col.title}
                </p>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-xs hover:text-white transition"
                      >
                        {link}
                      </a>
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
              <a href="#" className="hover:text-white transition">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition">
                Terms
              </a>
              <a href="#" className="hover:text-white transition">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
