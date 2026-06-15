/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import api from "../../services/api";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  MapPin,
  DollarSign,
  Briefcase,
  Star,
  Clock,
  ArrowLeft,
  Building2,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import {
  fetchBookmarks,
  addBookmark,
  removeBookmark,
} from "../../store/bookmarksSlice";

interface JobDetail {
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
  status: { status_name: string };
}

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);
  const { items: bookmarks } = useAppSelector((state) => state.bookmarks);
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data);
      } catch (err) {
        setError("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  // Fetch bookmarks if logged in
  useEffect(() => {
    if (token && user?.userType === "Job Seeker") {
      dispatch(fetchBookmarks());
    }
  }, [token, user, dispatch]);

  // Update bookmark status when bookmarks change
  useEffect(() => {
    if (bookmarks && job) {
      const saved = bookmarks.some(
        (b: any) => b.job?.id === job.id || b.jobId === job.id,
      );
      setIsBookmarked(saved);
    }
  }, [bookmarks, job]);

  const toggleBookmark = async () => {
    if (!token) {
      navigate("/login", { state: { from: `/jobs/${id}` } });
      return;
    }
    if (user?.userType !== "Job Seeker") {
      alert("Only job seekers can save jobs.");
      return;
    }
    try {
      if (isBookmarked) {
        await dispatch(removeBookmark(job!.id)).unwrap();
      } else {
        await dispatch(addBookmark(job!.id)).unwrap();
      }
      dispatch(fetchBookmarks());
    } catch (err) {
      console.error("Failed to toggle bookmark", err);
    }
  };

  const handleApply = () => {
    if (!token) {
      navigate("/login", { state: { from: `/jobs/${id}` } });
      return;
    }
    if (user?.userType !== "Job Seeker") {
      alert("Only job seekers can apply for jobs.");
      return;
    }
    navigate(`/apply/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-lg">{error || "Job not found"}</p>
        <Button onClick={() => navigate("/jobs")} className="mt-4">
          Back to Jobs
        </Button>
      </div>
    );
  }

  const rating = 4.6;
  const timeAgo = () => {
    const diff = Date.now() - new Date(job.created_at).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-purple-600 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to search
      </button>

      {/* Main Job Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="shrink-0">
              {job.employer.logo_url ? (
                <img
                  src={job.employer.logo_url}
                  alt={job.employer.company_name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-linear-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                  {job.employer.company_name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 size={16} className="text-gray-400" />
                    <span className="text-gray-600">
                      {job.employer.company_name}
                    </span>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1">
                      <Star
                        size={14}
                        className="text-yellow-400 fill-yellow-400"
                      />
                      <span className="text-sm font-medium">{rating}</span>
                    </div>
                  </div>
                </div>
                {/* Bookmark icon (ribbon) */}
                <button
                  onClick={toggleBookmark}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label={isBookmarked ? "Remove from saved" : "Save job"}
                >
                  {isBookmarked ? (
                    <BookmarkCheck
                      className="text-blue-500 fill-blue-500"
                      size={24}
                    />
                  ) : (
                    <Bookmark
                      className="text-gray-400 hover:text-blue-500"
                      size={24}
                    />
                  )}
                </button>
              </div>
              <div className="flex flex-wrap gap-3 mt-3">
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <MapPin size={14} />
                  <span>{job.employer.location || "Remote"}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Briefcase size={14} />
                  <span>{job.employment_type.type_name}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <DollarSign size={14} />
                  <span>{job.salary_range || "Competitive"}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Clock size={14} />
                  <span>{timeAgo()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pt-4">
          {(job as any).highlight_job && (
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
              Featured
            </Badge>
          )}
        </div>

        <div className="p-6">
          <h2 className="text-lg font-semibold mb-3">Job Description</h2>
          <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
            {job.description}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-2xl font-bold text-purple-600">
              {job.salary_range || "Negotiable"}
            </p>
            <p className="text-sm text-gray-500">per year</p>
          </div>
          <Button
            onClick={handleApply}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8"
            disabled={job.status.status_name !== "Open"}
          >
            {job.status.status_name !== "Open"
              ? "Position Closed"
              : token
                ? "Apply Now"
                : "Login to Apply"}
          </Button>
        </div>
      </div>
    </div>
  );
}
