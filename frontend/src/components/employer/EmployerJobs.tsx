import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAppSelector } from "../../store/hooks";
import { Job } from "./types";

interface EmployerJobsProps {
  onSelectJob: (jobId: string) => void;
}

export default function EmployerJobs({ onSelectJob }: EmployerJobsProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAppSelector((state) => state.auth);

  // Define fetchJobs first
  const fetchJobs = async () => {
    try {
      const res = await api.get("/employer/jobs");
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setLoading(false);
    }
  };

  // Define publishJob after fetchJobs
  const publishJob = async (jobId: string) => {
    if (!confirm("Publish this job? It will become visible to job seekers."))
      return;
    try {
      await api.patch(`/employer/jobs/${jobId}/publish`);
      await fetchJobs(); // Now fetchJobs is defined
    } catch (err) {
      console.error(err);
      alert("Failed to publish job");
    }
  };

  useEffect(() => {
    if (token) {
      fetchJobs();
    }
  }, [token]);

  if (loading) return <div className="p-4">Loading your jobs...</div>;
  if (jobs.length === 0)
    return <div className="p-4 text-gray-500">No jobs posted yet.</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Posted Date
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
            <tr key={job.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {job.title}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(job.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {job.status.status_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  onClick={() => onSelectJob(job.id)}
                  className="text-blue-600 hover:text-blue-800 mr-3"
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
  );
}
