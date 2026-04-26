import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchMyApplications } from "./applicationsSlice";
import { Link } from "react-router-dom";
import Loader from "../../components/common/Loader";

export default function MyApplications() {
  const dispatch = useAppDispatch();
  const { items, isLoading, error } = useAppSelector(
    (state) => state.applications,
  );
  const { token, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token && user?.userType === "Job Seeker") {
      dispatch(fetchMyApplications());
    }
  }, [dispatch, token, user]);

  if (!token || user?.userType !== "Job Seeker") {
    return (
      <div className="container mx-auto px-4 py-8">
        Please login as a job seeker to view your applications.
      </div>
    );
  }

  if (isLoading) return <Loader />;
  if (error)
    return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Applications</h1>
      {items.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border text-center text-gray-500">
          You haven't applied to any jobs yet.{" "}
          <Link to="/jobs" className="text-blue-600">
            Browse jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((app) => (
            <div
              key={app.id}
              className="bg-white p-4 rounded-lg border shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <Link
                    to={`/jobs/${app.job.id}`}
                    className="text-lg font-semibold text-blue-600 hover:underline"
                  >
                    {app.job.title}
                  </Link>
                  <p className="text-gray-600">
                    {app.job.employer.company_name}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                    <span>{app.job.employment_type.type_name}</span>
                    <span>{app.job.salary_range}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      app.status.status_name === "Accepted"
                        ? "bg-green-100 text-green-800"
                        : app.status.status_name === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : app.status.status_name === "Interview"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {app.status.status_name}
                  </span>
                </div>
              </div>
              {app.cover_letter && (
                <div className="mt-2 text-sm text-gray-600">
                  <strong>Cover letter:</strong> {app.cover_letter}
                </div>
              )}
              <div className="mt-2 text-xs text-gray-400">
                Applied on {new Date(app.applied_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
