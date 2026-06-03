import { Link } from "react-router-dom";

interface ApplicationCardProps {
  id: string;
  jobTitle: string;
  companyName: string;
  status: string;
  appliedAt: string;
}

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Interview: "bg-blue-100 text-blue-800",
  Accepted: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};

export default function ApplicationCard({
  id,
  jobTitle,
  companyName,
  status,
  appliedAt,
}: ApplicationCardProps) {
  return (
    <div className="border rounded-lg p-4 mb-3 shadow-sm hover:shadow transition">
      <div className="flex justify-between items-start">
        <div>
          <Link
            to={`/jobs/${id}`}
            className="text-lg font-semibold text-blue-600 hover:underline"
          >
            {jobTitle}
          </Link>
          <p className="text-gray-600">{companyName}</p>
          <p className="text-sm text-gray-500">
            Applied on {new Date(appliedAt).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-100"}`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}
