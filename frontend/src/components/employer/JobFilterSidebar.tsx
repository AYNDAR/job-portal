interface JobFilterSidebarProps {
  filters: {
    industry: string;
    employmentType: string;
    jobSite: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
];
const employmentTypes = [
  "Full-time",
  "Part-time",
  "Remote",
  "Contract",
  "Internship",
];
const jobSites = ["Onsite", "Remote", "Hybrid"];

export default function JobFilterSidebar({
  filters,
  onFilterChange,
}: JobFilterSidebarProps) {
  return (
    <aside className="sticky top-24 self-start w-64 bg-white p-4 rounded-lg shadow space-y-4">
      <h3 className="font-bold text-lg">Filter Jobs</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Industry
        </label>
        <select
          value={filters.industry}
          onChange={(e) => onFilterChange("industry", e.target.value)}
          className="w-full border rounded p-2 text-sm"
        >
          <option value="">All</option>
          {industries.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Employment Type
        </label>
        <select
          value={filters.employmentType}
          onChange={(e) => onFilterChange("employmentType", e.target.value)}
          className="w-full border rounded p-2 text-sm"
        >
          <option value="">All</option>
          {employmentTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Job Site
        </label>
        <select
          value={filters.jobSite}
          onChange={(e) => onFilterChange("jobSite", e.target.value)}
          className="w-full border rounded p-2 text-sm"
        >
          <option value="">All</option>
          {jobSites.map((site) => (
            <option key={site} value={site}>
              {site}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={() => {
          onFilterChange("industry", "");
          onFilterChange("employmentType", "");
          onFilterChange("jobSite", "");
        }}
        className="text-sm text-blue-600 hover:underline"
      >
        Clear filters
      </button>
    </aside>
  );
}
