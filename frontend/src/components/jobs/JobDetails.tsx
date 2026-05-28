/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import api from "../../services/api";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Globe,
  Building2,
  Clock,
  Home,
  Share2,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
} from "lucide-react";

interface JobData {
  id: string;
  title: string;
  description: string;
  salary_range: string;
  created_at: string;
  employer: {
    company_name: string;
    logo_url: string | null;
    website: string | null;
    location: string;
  };
  employment_type: { type_name: string };
  industry: { industry_name: string };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useAppSelector((state) => state.auth);

  const [job, setJob] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load job details");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = () => {
    if (!token) {
      // Fix: redirect to /login, save this page as destination (not dashboard)
      navigate("/login", { state: { from: `/jobs/${id}` } });
      return;
    }
    if (user?.userType !== "Job Seeker") {
      alert("Only job seekers can apply for jobs.");
      return;
    }
    navigate(`/apply/${id}`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back button skeleton */}
          <div className="h-8 w-24 bg-gray-200 rounded-xl animate-pulse mb-6" />
          <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse space-y-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-100 rounded w-2/3" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
              <div className="h-3 bg-gray-100 rounded w-4/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition"
            >
              <ArrowLeft size={14} /> Go Back
            </button>
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition"
            >
              <Home size={14} /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 font-medium mb-4">Job not found</p>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition w-fit mx-auto"
          >
            <Home size={14} /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const initial = job.employer.company_name?.[0]?.toUpperCase() || "C";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Mini top bar (Back + Home only — no full navbar) ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-13 flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition"
            >
              <ArrowLeft size={15} /> Back
            </button>
            <span className="text-gray-300">·</span>
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition"
            >
              <Home size={15} /> Home
            </Link>
            <span className="text-gray-300">·</span>
            <Link
              to="/jobs"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition"
            >
              <Briefcase size={15} /> All Jobs
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition"
            >
              <Share2 size={13} />
              {copied ? "Copied!" : "Share"}
            </button>
            <button
              onClick={() => setSaved(!saved)}
              className={`flex items-center gap-1.5 text-xs border px-3 py-1.5 rounded-xl transition ${
                saved
                  ? "text-blue-600 border-blue-200 bg-blue-50"
                  : "text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {saved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
              {saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Main content ────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Job header card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start gap-4 mb-5">
                {/* Company logo */}
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100">
                  {job.employer.logo_url ? (
                    <img
                      src={job.employer.logo_url}
                      alt={job.employer.company_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-blue-600">
                      {initial}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-gray-900 mb-1">
                    {job.title}
                  </h1>
                  <p className="text-base text-gray-600 font-medium">
                    {job.employer.company_name}
                  </p>
                  {job.employer.website && (
                    <a
                      href={job.employer.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 mt-1"
                    >
                      <Globe size={11} />{" "}
                      {job.employer.website.replace(/https?:\/\//, "")}
                      <ExternalLink size={9} />
                    </a>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
                  <MapPin size={11} className="text-gray-400" />{" "}
                  {job.employer.location}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
                  <Briefcase size={11} /> {job.employment_type.type_name}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
                  <DollarSign size={11} /> {job.salary_range || "Competitive"}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-violet-700 bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-xl">
                  <Building2 size={11} /> {job.industry.industry_name}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
                  <Clock size={11} /> Posted {timeAgo(job.created_at)}
                </span>
              </div>

              {/* Apply button — inline in header for mobile */}
              <div className="lg:hidden">
                <button
                  onClick={handleApply}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition text-sm"
                >
                  {!token ? "Login to Apply" : "Apply Now"}
                </button>
              </div>
            </div>

            {/* Job description */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">
                Job Description
              </h2>
              <div
                className="prose prose-sm max-w-none text-gray-700 leading-relaxed
                  prose-headings:text-gray-900 prose-headings:font-semibold
                  prose-li:text-gray-700 prose-strong:text-gray-900
                  prose-ul:space-y-1 prose-ol:space-y-1"
                dangerouslySetInnerHTML={{
                  __html:
                    job.description
                      ?.replace(/\n\n/g, "</p><p class='mb-3'>")
                      .replace(/\n/g, "<br/>") || "",
                }}
              />
            </div>
          </div>

          {/* ── Sidebar ──────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Apply card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20">
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  Ready to apply?
                </p>
                <p className="text-xs text-gray-500">
                  {!token
                    ? "Sign in to apply for this position."
                    : user?.userType !== "Job Seeker"
                      ? "Only job seekers can apply."
                      : "Submit your application directly to the employer."}
                </p>
              </div>

              <button
                onClick={handleApply}
                disabled={!!token && user?.userType !== "Job Seeker"}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition text-sm mb-3"
              >
                {!token ? "Login to Apply" : "Apply Now"}
              </button>

              {/* If not logged in, show register option too */}
              {!token && (
                <Link
                  to="/register"
                  className="block w-full text-center border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-600 font-medium py-2.5 rounded-xl transition text-sm"
                >
                  Create an Account
                </Link>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2.5">
                {[
                  {
                    icon: <DollarSign size={13} />,
                    label: "Salary",
                    value: job.salary_range || "Competitive",
                  },
                  {
                    icon: <Briefcase size={13} />,
                    label: "Type",
                    value: job.employment_type.type_name,
                  },
                  {
                    icon: <MapPin size={13} />,
                    label: "Location",
                    value: job.employer.location,
                  },
                  {
                    icon: <Building2 size={13} />,
                    label: "Industry",
                    value: job.industry.industry_name,
                  },
                  {
                    icon: <Calendar size={13} />,
                    label: "Posted",
                    value: timeAgo(job.created_at),
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <span className="text-gray-400 shrink-0">{item.icon}</span>
                    <span className="text-xs text-gray-500 shrink-0">
                      {item.label}:
                    </span>
                    <span className="text-xs font-medium text-gray-800 truncate">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Company card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                About the Company
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {job.employer.logo_url ? (
                    <img
                      src={job.employer.logo_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-blue-600">
                      {initial}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {job.employer.company_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {job.industry.industry_name}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin size={11} className="shrink-0" />{" "}
                  {job.employer.location}
                </div>
                {job.employer.website && (
                  <a
                    href={job.employer.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs text-blue-500 hover:text-blue-700 transition"
                  >
                    <Globe size={11} className="shrink-0" />
                    {job.employer.website.replace(/https?:\/\//, "")}
                  </a>
                )}
              </div>
              <Link
                to={`/jobs?company=${encodeURIComponent(job.employer.company_name)}`}
                className="mt-3 block w-full text-center text-xs text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 py-2 rounded-xl transition font-medium"
              >
                View all jobs from {job.employer.company_name}
              </Link>
            </div>

            {/* Back to home */}
            <Link
              to="/"
              className="flex items-center justify-center gap-2 w-full text-sm text-gray-600 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 py-2.5 rounded-xl transition font-medium"
            >
              <Home size={14} /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
