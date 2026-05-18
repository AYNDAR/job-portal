import { useEffect, useState } from "react";
import api from "../../../services/api";

interface Application {
  id: string;
  job: { title: string; employer: { company_name: string } };
  seeker: { full_name: string; email: string };
  status: { status_name: string };
  applied_at: string;
}

export default function ApplicationsManagement() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get("/admin/applications");
        setApplications(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  if (loading) return <div>Loading applications...</div>;

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm">
      <h2 className="text-xl font-bold mb-4">All Applications</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Company</th>
              <th>Applicant</th>
              <th>Email</th>
              <th>Status</th>
              <th>Applied</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-b">
                <td className="py-2">{app.job.title}</td>
                <td>{app.job.employer.company_name}</td>
                <td>{app.seeker.full_name}</td>
                <td>{app.seeker.email}</td>
                <td>
                  <span className="px-2 py-1 rounded text-xs bg-yellow-100">
                    {app.status.status_name}
                  </span>
                </td>
                <td>{new Date(app.applied_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
