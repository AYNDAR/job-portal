import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAppSelector } from "../../store/hooks";

interface Job {
  id: string;
  title: string;
  description: string;
  salary_range: string | null;
  created_at: string;
  status: { status_name: string };
  applicationsCount?: number;
}

interface EmployerJobsProps {
  onSelectJob: (jobId: string) => void;
  refreshTrigger?: boolean;
  onPublish?: () => void;
}

export default function EmployerJobs({
  onSelectJob,
  refreshTrigger,
  onPublish,
}: EmployerJobsProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAppSelector((state) => state.auth);

  const fetchJobs = async () => {
    try {
      const res = await api.get("/employer/jobs");
      // Enhance with application count (optional)
      const jobsWithCount = await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        res.data.map(async (job: any) => {
          const countRes = await api
            .get(`/employer/jobs/${job.id}/applicants`)
            .catch(() => ({ data: [] }));
          return { ...job, applicationsCount: countRes.data?.length || 0 };
        }),
      );
      setJobs(jobsWithCount);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setLoading(false);
    }
  };

  const publishJob = async (jobId: string) => {
    if (!confirm("Publish this job? It will become visible to job seekers."))
      return;
    try {
      await api.patch(`/employer/jobs/${jobId}/publish`);
      await fetchJobs();
      if (onPublish) onPublish();
    } catch (err) {
      console.error(err);
      alert("Failed to publish job");
    }
  };

  useEffect(() => {
    if (token) fetchJobs();
  }, [token, refreshTrigger]);

  if (loading) return <div className="p-4">Loading your jobs...</div>;
  if (jobs.length === 0)
    return <div className="p-4 text-gray-500">No jobs posted yet.</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Job Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Posted Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Applications
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {job.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(job.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {job.applicationsCount || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      job.status.status_name === "Open"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {job.status.status_name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    onClick={() => onSelectJob(job.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View Applicants
                  </button>
                  {job.status.status_name === "Draft" && (
                    <button
                      onClick={() => publishJob(job.id)}
                      className="text-green-600 hover:text-green-800"
                    >
                      Publish
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
