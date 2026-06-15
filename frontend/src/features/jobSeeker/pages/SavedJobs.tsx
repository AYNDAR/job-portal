import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootState, AppDispatch } from "../../../store";
import { fetchBookmarks } from "../jobSeekerSlice";
import { Briefcase, MapPin, DollarSign, Calendar, Heart } from "lucide-react";

interface BookmarkItem {
  id: number;
  job: {
    id: string;
    title: string;
    salary_range?: string;
    employer?: {
      company_name?: string;
      location?: string;
    };
    employment_type?: {
      type_name?: string;
    };
  };
  created_at: string;
}

export default function SavedJobs() {
  const dispatch = useDispatch<AppDispatch>();
  const { bookmarks } = useSelector((state: RootState) => state.jobSeeker);

  // Safe double assertion to match expected type
  const typedBookmarks = bookmarks as unknown as BookmarkItem[];

  useEffect(() => {
    dispatch(fetchBookmarks());
  }, [dispatch]);

  if (!typedBookmarks || typedBookmarks.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Heart size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">No saved jobs</h3>
        <p className="text-sm text-gray-500 mt-1">
          Bookmark jobs you're interested in to see them here.
        </p>
        <Link
          to="/jobs"
          className="inline-block mt-4 text-purple-600 hover:text-purple-700 font-medium"
        >
          Browse Jobs →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Saved Jobs</h2>
        <p className="text-sm text-gray-500 mt-1">
          Jobs you've bookmarked for later
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {typedBookmarks.map((bookmark) => {
          const job = bookmark.job;
          if (!job) return null;
          return (
            <div
              key={bookmark.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div className="flex-1">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-purple-600 transition"
                    >
                      {job.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {job.employer?.company_name || "Company"}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                    Saved
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                  {job.employer?.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-gray-400" />
                      {job.employer.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Briefcase size={14} className="text-gray-400" />
                    {job.employment_type?.type_name || "Full-time"}
                  </span>
                  {job.salary_range && (
                    <span className="flex items-center gap-1.5">
                      <DollarSign size={14} className="text-gray-400" />
                      {job.salary_range}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-gray-400" />
                    Saved: {new Date(bookmark.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-4 flex gap-3">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 transition"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
