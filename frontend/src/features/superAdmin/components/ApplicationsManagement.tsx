import { useEffect, useState } from "react";
import api from "../../../services/api";
import { Search, Eye, X } from "lucide-react";

interface Application {
  id: string;
  job: {
    id: string;
    title: string;
    employer: { company_name: string; location?: string };
    industry: { industry_name: string };
  };
  seeker: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    location?: string;
    resume_url?: string;
  };
  status: { status_name: string };
  cover_letter?: string;
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
      setApplications(res.data);
      setFiltered(res.data);
    } catch (error) {
      console.error("Failed to fetch applications, using mock data", error);
      // Mock data for demo (fallback)
      const mockApps: Application[] = [
        {
          id: "1",
          job: {
            id: "j1",
            title: "Senior React Developer",
            employer: { company_name: "TechCorp", location: "Addis Ababa" },
            industry: { industry_name: "Technology" },
          },
          seeker: {
            id: "s1",
            full_name: "Cherinet Darge",
            email: "cherinet@example.com",
            phone: "+251911223344",
            location: "Addis Ababa",
            resume_url: "#",
          },
          status: { status_name: "Pending" },
          cover_letter: "I am very interested in this position...",
          applied_at: new Date().toISOString(),
        },
        {
          id: "2",
          job: {
            id: "j2",
            title: "Financial Analyst",
            employer: { company_name: "FinCorp", location: "Nairobi" },
            industry: { industry_name: "Finance" },
          },
          seeker: {
            id: "s2",
            full_name: "Cherinet Darge",
            email: "cherinet@example.com",
            phone: "+251911223344",
            location: "Addis Ababa",
            resume_url: "#",
          },
          status: { status_name: "Pending" },
          cover_letter: "I have a background in finance...",
          applied_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        },
      ];
      setApplications(mockApps);
      setFiltered(mockApps);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    let result = [...applications];
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.job.title.toLowerCase().includes(term) ||
          a.seeker.full_name.toLowerCase().includes(term) ||
          a.seeker.email.toLowerCase().includes(term),
      );
    }
    if (statusFilter !== "All") {
      result = result.filter((a) => a.status.status_name === statusFilter);
    }
    setFiltered(result);
  }, [search, statusFilter, applications]);

  const viewDetails = (app: Application) => {
    console.log("View clicked for app:", app);
    setSelectedApp(app);
  };
  const closeModal = () => setSelectedApp(null);

  if (loading)
    return <div className="p-8 text-center">Loading applications...</div>;

  return (
    <div className="space-y-4">
      {/* Filters */}
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

      {/* Applications Table */}
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

      {/* View Application Modal */}
      {selectedApp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                Application Details
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <strong>Job Title:</strong> {selectedApp.job.title}
              </div>
              <div>
                <strong>Company:</strong>{" "}
                {selectedApp.job.employer.company_name}
              </div>
              <div>
                <strong>Applicant:</strong> {selectedApp.seeker.full_name}
              </div>
              <div>
                <strong>Email:</strong> {selectedApp.seeker.email}
              </div>
              <div>
                <strong>Status:</strong> {selectedApp.status.status_name}
              </div>
              <div>
                <strong>Applied on:</strong>{" "}
                {new Date(selectedApp.applied_at).toLocaleString()}
              </div>
              {selectedApp.cover_letter && (
                <div>
                  <strong>Cover Letter:</strong>{" "}
                  <p className="mt-1 bg-gray-50 p-2 rounded">
                    {selectedApp.cover_letter}
                  </p>
                </div>
              )}
              {selectedApp.seeker.resume_url && (
                <div>
                  <strong>Resume:</strong>{" "}
                  <a
                    href={selectedApp.seeker.resume_url}
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    View Resume
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
