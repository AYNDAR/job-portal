/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  FileText,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Home,
  ExternalLink,
  Calendar,
} from "lucide-react";

interface Application {
  id: string;
  jobId?: string;
  job_id?: string;
  jobTitle?: string;
  cover_letter?: string;
  coverLetter?: string;
  applied_at?: string;
  appliedAt?: string;
  created_at?: string;
  status?: string | { status_name: string };
  job?: {
    id: string;
    title: string;
    employer?: { company_name: string; location?: string };
    employment_type?: { type_name: string };
    salary_range?: string;
  };
}

// ── Normalize status from various shapes ──────────────────────
function getStatus(app: Application): string {
  if (!app.status) return "Pending";
  if (typeof app.status === "string") return app.status;
  return (app.status as any).status_name || "Pending";
}

// ── Normalize job title from various shapes ───────────────────
function getTitle(app: Application): string {
  return app.job?.title || app.jobTitle || "Unknown Job";
}

function getCompany(app: Application): string {
  return app.job?.employer?.company_name || "";
}

function getJobId(app: Application): string {
  return app.job?.id || app.jobId || app.job_id || "";
}

function getDate(app: Application): string {
  const d = app.applied_at || app.appliedAt || app.created_at;
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const statusStyles: Record<string, { color: string; icon: React.ReactNode }> = {
  Pending: {
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: <Clock size={12} />,
  },
  Interview: {
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <Calendar size={12} />,
  },
  Accepted: {
    color: "bg-green-50 text-green-700 border-green-200",
    icon: <CheckCircle size={12} />,
  },
  Rejected: {
    color: "bg-red-50 text-red-600 border-red-200",
    icon: <XCircle size={12} />,
  },
  Reviewed: {
    color: "bg-violet-50 text-violet-700 border-violet-200",
    icon: <FileText size={12} />,
  },
};

function StatusBadge({ status }: { status: string }) {
  const s = statusStyles[status] || statusStyles["Pending"];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${s.color}`}
    >
      {s.icon} {status}
    </span>
  );
}

export default function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to view your applications.");
      setLoading(false);
      return;
    }

    // Try both common endpoints — use whichever succeeds
    const tryFetch = async () => {
      const endpoints = [
        "/applications/my-applications",
        "/applications/mine",
        "/applications",
        "/jobseeker/applications",
      ];

      for (const endpoint of endpoints) {
        try {
          const res = await api.get(endpoint);
          const data = Array.isArray(res.data)
            ? res.data
            : res.data.applications || res.data.data || [];
          setApplications(data);
          return; // success — stop trying
        } catch (err: any) {
          // 404 = wrong endpoint, keep trying; other errors = real problem
          if (err.response?.status !== 404) {
            setError(
              err.response?.data?.error ||
                err.response?.data?.message ||
                "Failed to load applications.",
            );
            return;
          }
        }
      }
      // All endpoints 404'd
      setError(
        "Could not find applications endpoint. Please check your backend routes.",
      );
    };

    tryFetch().finally(() => setLoading(false));
  }, []);

  // ── Loading ─────────────────────────────────────────────────
  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading your applications...</p>
        </div>
      </div>
    );

  // ── Error ───────────────────────────────────────────────────
  if (error)
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <AlertCircle size={40} className="mx-auto text-red-400 mb-3" />
            <p className="text-gray-700 font-medium mb-1">
              Something went wrong
            </p>
            <p className="text-sm text-red-500 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <Link
                to="/login"
                className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition"
              >
                Sign In
              </Link>
              <Link
                to="/"
                className="text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-xl transition"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Back + Home */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 bg-white px-3 py-2 rounded-xl hover:bg-gray-50 transition"
          >
            <ArrowLeft size={15} /> Back
          </button>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 bg-white px-3 py-2 rounded-xl hover:bg-gray-50 transition"
          >
            <Home size={15} /> Home
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Applications
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {applications.length === 0
                ? "No applications yet"
                : `${applications.length} application${applications.length !== 1 ? "s" : ""} submitted`}
            </p>
          </div>
          <Link
            to="/jobs"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition shadow-sm"
          >
            <Briefcase size={14} /> Find Jobs
          </Link>
        </div>

        {/* Empty state */}
        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
            <FileText size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-600 font-semibold mb-1">
              No applications yet
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Start applying to jobs and track your progress here.
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm"
            >
              <Briefcase size={14} /> Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const status = getStatus(app);
              const title = getTitle(app);
              const company = getCompany(app);
              const jobId = getJobId(app);
              const date = getDate(app);

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-11 h-11 bg-linear-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                      <Briefcase size={18} className="text-blue-500" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                          {jobId ? (
                            <Link
                              to={`/jobs/${jobId}`}
                              className="text-base font-semibold text-gray-900 hover:text-blue-600 transition flex items-center gap-1.5"
                            >
                              {title}{" "}
                              <ExternalLink
                                size={13}
                                className="text-gray-400 shrink-0"
                              />
                            </Link>
                          ) : (
                            <p className="text-base font-semibold text-gray-900">
                              {title}
                            </p>
                          )}
                          {company && (
                            <p className="text-sm text-gray-500 mt-0.5">
                              {company}
                            </p>
                          )}
                        </div>
                        <StatusBadge status={status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        {date && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar size={11} /> Applied {date}
                          </span>
                        )}
                        {app.job?.employment_type?.type_name && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            {app.job.employment_type.type_name}
                          </span>
                        )}
                        {app.job?.salary_range && (
                          <span className="text-xs text-gray-500">
                            {app.job.salary_range}
                          </span>
                        )}
                        {app.job?.employer?.location && (
                          <span className="text-xs text-gray-400">
                            {app.job.employer.location}
                          </span>
                        )}
                      </div>

                      {/* Cover letter preview */}
                      {(app.cover_letter || app.coverLetter) && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-1 italic">
                          "{app.cover_letter || app.coverLetter}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                    <span className="text-xs text-gray-400">
                      Application #{app.id}
                    </span>
                    {jobId && (
                      <Link
                        to={`/jobs/${jobId}`}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:underline"
                      >
                        View job <ExternalLink size={11} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
