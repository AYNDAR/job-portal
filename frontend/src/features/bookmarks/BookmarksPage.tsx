import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchBookmarks, removeBookmark } from "./bookmarksSlice";
import { Link } from "react-router-dom";
import Loader from "../../components/common/Loader";
import { MapPin, Briefcase, DollarSign, Trash2 } from "lucide-react";

export default function BookmarksPage() {
  const dispatch = useAppDispatch();
  const { items, isLoading } = useAppSelector((state) => state.bookmarks);
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchBookmarks());
    }
  }, [dispatch, token]);

  const handleRemove = (jobId: string) => {
    dispatch(removeBookmark(jobId));
  };

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-8">
        Please login to view bookmarks.
      </div>
    );
  }

  if (isLoading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Bookmarked Jobs</h1>
      {items.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border text-center text-gray-500">
          No bookmarked jobs yet. Start saving jobs you're interested in!
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((bookmark) => (
            <div
              key={bookmark.id}
              className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <Link
                    to={`/jobs/${bookmark.job.id}`}
                    className="text-xl font-semibold text-blue-600 hover:underline"
                  >
                    {bookmark.job.title}
                  </Link>
                  <p className="text-gray-700 mt-1">
                    {bookmark.job.employer.company_name}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{" "}
                      {bookmark.job.employer.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />{" "}
                      {bookmark.job.employment_type.type_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />{" "}
                      {bookmark.job.salary_range}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(bookmark.job.id)}
                  className="text-red-600 hover:text-red-800"
                  aria-label="Remove bookmark"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-3 text-xs text-gray-400">
                Bookmarked on{" "}
                {new Date(bookmark.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
