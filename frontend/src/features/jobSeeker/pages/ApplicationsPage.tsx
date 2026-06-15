/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../../../store";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Calendar, Briefcase, ExternalLink } from "lucide-react";

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Interview: "bg-blue-100 text-blue-800",
  Accepted: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};

export default function ApplicationsPage() {
  const { applications } = useSelector((state: RootState) => state.jobSeeker);

  if (!applications || applications.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <p className="text-gray-500">No applications yet.</p>
          <Link
            to="/jobs"
            className="text-purple-600 text-sm mt-2 inline-block"
          >
            Browse Jobs →
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">My Applications</h2>
      <div className="space-y-3">
        {applications.map((app: any) => (
          <div
            key={app.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Job title as clickable link */}
                  <Link
                    to={`/jobs/${app.job?.id || app.jobId}`}
                    className="text-lg font-semibold text-gray-900 hover:text-purple-600 hover:underline transition"
                  >
                    {app.jobTitle || app.job?.title || "Job Title"}
                  </Link>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {app.companyName || app.employer?.company_name || "Company"}
                  </p>
                </div>
                <Badge className={statusColors[app.status] || "bg-gray-100"}>
                  {app.status || "Pending"}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar size={14} /> Applied:{" "}
                  {new Date(
                    app.appliedAt || app.applied_at,
                  ).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase size={14} /> {app.jobType || "Full-time"}
                </span>
              </div>
              {app.coverLetter && (
                <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                  {app.coverLetter}
                </p>
              )}
              <div className="mt-3 pt-2 border-t border-gray-50">
                <Link
                  to={`/jobs/${app.job?.id || app.jobId}`}
                  className="text-xs text-purple-600 hover:text-purple-700 inline-flex items-center gap-1"
                >
                  View Job Details <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
