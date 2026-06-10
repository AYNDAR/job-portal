/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import api from "../../../services/api";
import { Search, Eye, X } from "lucide-react";

interface Application {
  id: string;
  job: { title: string; employer: { company_name: string } };
  seeker: { full_name: string; email: string };
  status: { status_name: string };
  applied_at: string;
}

export default function ApplicationsManagement() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filtered, setFiltered] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/applications");
      const safeData = (res.data || []).map((app: any) => ({
        id: app.id || "",
        job: {
          title: app.job?.title || "Unknown Job",
          employer: {
            company_name: app.job?.employer?.company_name || "Unknown Company",
          },
        },
        seeker: {
          full_name: app.seeker?.full_name || "Unknown",
          email: app.seeker?.email || "",
        },
        status: { status_name: app.status?.status_name || "Pending" },
        applied_at: app.applied_at || new Date().toISOString(),
      }));
      setApplications(safeData);
      setFiltered(safeData);
    } catch (error) {
      console.error("Failed to fetch applications", error);
      setApplications([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    let result = [...applications];
    if (search.trim() !== "") {
      const term = search.toLowerCase();
      result = result.filter((a) => {
        const jobTitle = (a.job?.title || "").toLowerCase();
        const applicantName = (a.seeker?.full_name || "").toLowerCase();
        const applicantEmail = (a.seeker?.email || "").toLowerCase();
        return (
          jobTitle.includes(term) ||
          applicantName.includes(term) ||
          applicantEmail.includes(term)
        );
      });
    }
    if (statusFilter !== "All") {
      result = result.filter(
        (a) => (a.status?.status_name || "") === statusFilter,
      );
    }
    setFiltered(result);
  }, [search, statusFilter, applications]);

  const viewDetails = (app: Application) => setSelectedApp(app);
  const closeModal = () => setSelectedApp(null);

  if (loading)
    return <div className="p-8 text-center">Loading applications...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by job title, applicant name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-100"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Interview">Interview</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Job
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Applied
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((app) => (
                <tr key={app.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.job.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {app.seeker.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        app.status.status_name === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : app.status.status_name === "Interview"
                            ? "bg-blue-100 text-blue-700"
                            : app.status.status_name === "Accepted"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                      }`}
                    >
                      {app.status.status_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(app.applied_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => viewDetails(app)}
                      className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
                    >
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No applications found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedApp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Application Details</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Job:</strong> {selectedApp.job.title}
              </p>
              <p>
                <strong>Company:</strong>{" "}
                {selectedApp.job.employer.company_name}
              </p>
              <p>
                <strong>Applicant:</strong> {selectedApp.seeker.full_name}
              </p>
              <p>
                <strong>Email:</strong> {selectedApp.seeker.email}
              </p>
              <p>
                <strong>Status:</strong> {selectedApp.status.status_name}
              </p>
              <p>
                <strong>Applied:</strong>{" "}
                {new Date(selectedApp.applied_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
