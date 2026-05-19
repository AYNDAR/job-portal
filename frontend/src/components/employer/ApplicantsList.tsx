import React, { useState, useMemo } from "react";

// Type definition for an application record
interface Application {
  id: string;
  jobTitle: string;
  company: string;
  applicant: string;
  email: string;
  status: "Pending" | "Reviewed" | "Accepted" | "Rejected";
  appliedOn: Date;
}

// Helper to format dates
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

// Sample mock data (rich and realistic)
const initialApplications: Application[] = [
  {
    id: "1",
    jobTitle: "Senior Frontend Developer",
    company: "TechCorp",
    applicant: "Emily Johnson",
    email: "emily.johnson@example.com",
    status: "Pending",
    appliedOn: new Date(2025, 2, 15),
  },
  {
    id: "2",
    jobTitle: "Backend Engineer",
    company: "InnoSoft",
    applicant: "Michael Chen",
    email: "michael.chen@example.com",
    status: "Reviewed",
    appliedOn: new Date(2025, 2, 10),
  },
  {
    id: "3",
    jobTitle: "UI/UX Designer",
    company: "Design Studio",
    applicant: "Sophia Rodriguez",
    email: "sophia.r@example.com",
    status: "Accepted",
    appliedOn: new Date(2025, 2, 5),
  },
  {
    id: "4",
    jobTitle: "Product Manager",
    company: "Visionary Labs",
    applicant: "James Wilson",
    email: "jwilson@example.com",
    status: "Rejected",
    appliedOn: new Date(2025, 1, 28),
  },
  {
    id: "5",
    jobTitle: "DevOps Specialist",
    company: "CloudNet",
    applicant: "Olivia Martinez",
    email: "olivia.m@example.com",
    status: "Reviewed",
    appliedOn: new Date(2025, 2, 12),
  },
  {
    id: "6",
    jobTitle: "Data Scientist",
    company: "DataMind AI",
    applicant: "Liam Thompson",
    email: "liam.thompson@example.com",
    status: "Pending",
    appliedOn: new Date(2025, 2, 14),
  },
  {
    id: "7",
    jobTitle: "Mobile Developer",
    company: "AppWorks",
    applicant: "Ava Garcia",
    email: "ava.garcia@example.com",
    status: "Accepted",
    appliedOn: new Date(2025, 2, 1),
  },
  {
    id: "8",
    jobTitle: "QA Engineer",
    company: "QualityFirst",
    applicant: "Noah Lee",
    email: "noah.lee@example.com",
    status: "Rejected",
    appliedOn: new Date(2025, 1, 20),
  },
];

// Type for sort configuration
type SortKey = keyof Omit<Application, "id" | "appliedOn"> | "appliedOn";
type SortDirection = "asc" | "desc";

const ApplicationTable: React.FC = () => {
  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    Application["status"] | "All"
  >("All");
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  } | null>(null);

  // Handle sorting request
  const requestSort = (key: SortKey) => {
    let direction: SortDirection = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Get sort indicator
  const getSortIndicator = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? " ↑" : " ↓";
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    // First apply filters
    // eslint-disable-next-line prefer-const
    let filtered = initialApplications.filter((app) => {
      // Search filter (applicant name or email)
      const matchesSearch =
        searchTerm === "" ||
        app.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "All" || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Then apply sorting
    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        let aValue: string | Date = "";
        let bValue: string | Date = "";

        switch (sortConfig.key) {
          case "jobTitle":
            aValue = a.jobTitle;
            bValue = b.jobTitle;
            break;
          case "company":
            aValue = a.company;
            bValue = b.company;
            break;
          case "applicant":
            aValue = a.applicant;
            bValue = b.applicant;
            break;
          case "email":
            aValue = a.email;
            bValue = b.email;
            break;
          case "status":
            aValue = a.status;
            bValue = b.status;
            break;
          case "appliedOn":
            aValue = a.appliedOn;
            bValue = b.appliedOn;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [searchTerm, statusFilter, sortConfig]);

  // Status badge styling
  const getStatusBadge = (status: Application["status"]) => {
    const styles = {
      Pending: "bg-yellow-100 text-yellow-800 ring-yellow-600/20",
      Reviewed: "bg-blue-100 text-blue-800 ring-blue-600/20",
      Accepted: "bg-green-100 text-green-800 ring-green-600/20",
      Rejected: "bg-red-100 text-red-800 ring-red-600/20",
    };
    return (
      <span
        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${styles[status]}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 font-sans">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              All Applications
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and review job applications from candidates
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="rounded-full bg-white px-3 py-1 shadow-sm">
              {filteredAndSortedData.length} of {initialApplications.length}{" "}
              applications
            </span>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by applicant or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as Application["status"] | "All")
              }
              className="rounded-lg border-0 py-2.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
            {(searchTerm !== "" || statusFilter !== "All") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All");
                }}
                className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="cursor-pointer px-6 py-3.5 text-left text-sm font-semibold text-gray-900 hover:bg-gray-100"
                    onClick={() => requestSort("jobTitle")}
                  >
                    Job Title{getSortIndicator("jobTitle")}
                  </th>
                  <th
                    scope="col"
                    className="cursor-pointer px-6 py-3.5 text-left text-sm font-semibold text-gray-900 hover:bg-gray-100"
                    onClick={() => requestSort("company")}
                  >
                    Company{getSortIndicator("company")}
                  </th>
                  <th
                    scope="col"
                    className="cursor-pointer px-6 py-3.5 text-left text-sm font-semibold text-gray-900 hover:bg-gray-100"
                    onClick={() => requestSort("applicant")}
                  >
                    Applicant{getSortIndicator("applicant")}
                  </th>
                  <th
                    scope="col"
                    className="cursor-pointer px-6 py-3.5 text-left text-sm font-semibold text-gray-900 hover:bg-gray-100"
                    onClick={() => requestSort("email")}
                  >
                    Email{getSortIndicator("email")}
                  </th>
                  <th
                    scope="col"
                    className="cursor-pointer px-6 py-3.5 text-left text-sm font-semibold text-gray-900 hover:bg-gray-100"
                    onClick={() => requestSort("status")}
                  >
                    Status{getSortIndicator("status")}
                  </th>
                  <th
                    scope="col"
                    className="cursor-pointer px-6 py-3.5 text-left text-sm font-semibold text-gray-900 hover:bg-gray-100"
                    onClick={() => requestSort("appliedOn")}
                  >
                    Applied On{getSortIndicator("appliedOn")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredAndSortedData.length > 0 ? (
                  filteredAndSortedData.map((application) => (
                    <tr
                      key={application.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {application.jobTitle}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {application.company}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {application.applicant}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {application.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {getStatusBadge(application.status)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatDate(application.appliedOn)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-sm text-gray-500"
                    >
                      No applications found matching the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-4 text-center text-xs text-gray-400">
          Showing {filteredAndSortedData.length} application(s)
        </div>
      </div>
    </div>
  );
};

export default ApplicationTable;
