import { Link } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";

interface JobCardProps {
  id: string;
  title: string;
  companyName: string;
  location: string;
  employmentType: string;
  salaryRange: string;
  postedAt: string;
  isBookmarked?: boolean;
  onBookmark?: (id: string) => void;
  showBookmark?: boolean;
}

export default function JobCard({
  id,
  title,
  companyName,
  location,
  employmentType,
  salaryRange,
  postedAt,
  isBookmarked = false,
  onBookmark,
  showBookmark = true,
}: JobCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Link
            to={`/jobs/${id}`}
            className="text-xl font-semibold text-blue-600 hover:underline"
          >
            {title}
          </Link>
          <p className="text-gray-700 mt-1">{companyName}</p>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {location}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" /> {employmentType}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> {salaryRange}
            </span>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {showBookmark && onBookmark && (
            <button
              onClick={() => onBookmark(id)}
              className="text-gray-500 hover:text-yellow-500 transition"
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark job"}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-5 w-5 text-yellow-500" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </button>
          )}
          <Link
            to={`/jobs/${id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            Apply Now
          </Link>
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-400">Posted {postedAt}</div>
    </div>
  );
}
