import {
  MapPin,
  Briefcase,
  DollarSign,
  Building,
  Calendar,
  Globe,
} from "lucide-react";
import { Link } from "react-router-dom";

interface JobDetailsProps {
  id: string;
  title: string;
  description: string;
  salaryRange: string;
  createdAt: string;
  companyName: string;
  companyLogo?: string | null;
  companyWebsite?: string | null;
  location: string;
  employmentType: string;
  industryName: string;
  isAuthenticated: boolean;
  userType?: string;
  onApply: () => void;
}

export default function JobDetails({
  title,
  description,
  salaryRange,
  createdAt,
  companyName,
  companyLogo,
  companyWebsite,
  location,
  employmentType,
  industryName,
  isAuthenticated,
  userType,
  onApply,
}: JobDetailsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <div className="mt-2 flex items-center gap-2 text-gray-600">
              <Building className="h-4 w-4" />
              <span>{companyName}</span>
              {companyWebsite && (
                <a
                  href={companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm hover:underline ml-2"
                >
                  Visit website
                </a>
              )}
            </div>
          </div>
          {companyLogo && (
            <img
              src={companyLogo}
              alt={companyName}
              className="h-12 w-12 object-contain"
            />
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1 text-gray-500">
            <MapPin className="h-4 w-4" /> {location}
          </span>
          <span className="flex items-center gap-1 text-gray-500">
            <Briefcase className="h-4 w-4" /> {employmentType}
          </span>
          <span className="flex items-center gap-1 text-green-600 font-semibold">
            <DollarSign className="h-4 w-4" /> {salaryRange}
          </span>
          <span className="flex items-center gap-1 text-gray-500">
            <Calendar className="h-4 w-4" /> Posted{" "}
            {new Date(createdAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1 text-gray-500">
            <Globe className="h-4 w-4" /> {industryName}
          </span>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Job Description</h2>
          <div className="text-gray-700 whitespace-pre-wrap">{description}</div>
        </div>

        <div className="mt-8">
          {!isAuthenticated ? (
            <Link
              to="/login"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Login to Apply
            </Link>
          ) : userType !== "Job Seeker" ? (
            <button
              disabled
              className="bg-gray-400 text-white px-6 py-2 rounded-lg cursor-not-allowed"
            >
              Only Job Seekers Can Apply
            </button>
          ) : (
            <button
              onClick={onApply}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Apply Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
