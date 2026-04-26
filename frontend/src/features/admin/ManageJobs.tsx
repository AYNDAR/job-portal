import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAppSelector } from "../../store/hooks";

interface Job {
  id: string;
  title: string;
  employer: { company_name: string };
  status: { status_name: string };
  created_at: string;
}

export default function ManageJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAppSelector((state) => state.auth);

  const fetchJobs = async () => {
    try {
      const res = await api.get("/admin/jobs");
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchJobs();
  }, [token]);

  const closeJob = async (jobId: string) => {
    if (
      !confirm(
        "Close this job posting? It will no longer be visible to seekers.",
      )
    )
      return;
    await api.patch(`/admin/jobs/${jobId}/close`);
    fetchJobs();
  };

  if (loading) return <div className="p-4">Loading jobs...</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Company
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Posted
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {jobs.map((job) => (
            <tr key={job.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {job.title}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {job.employer.company_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {job.status.status_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(job.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  onClick={() => closeJob(job.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Close
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
