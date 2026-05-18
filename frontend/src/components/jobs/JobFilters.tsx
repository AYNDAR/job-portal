// src/components/jobs/JobFilters.tsx
interface JobFiltersProps {
  filters: {
    industry: string; // sector / category
    type: string; // employment type
    salary: string;
    jobSite: string;
    experienceLevel: string;
    educationLevel: string;
    genderPreference: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export default function JobFilters({
  filters,
  onFilterChange,
}: JobFiltersProps) {
  const sectors = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Retail",
    "Construction",
  ];
  const jobTypes = [
    "Full-time",
    "Part-time",
    "Remote",
    "Contract",
    "Internship",
  ];
  const jobSites = ["Onsite", "Remote", "Hybrid"];
  const experienceLevels = ["Junior", "Mid", "Senior", "Lead"];
  const educationLevels = ["High School", "Bachelor", "Master", "PhD"];
  const genderPreferences = ["Any", "Male", "Female"];

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm space-y-6">
      <h3 className="font-bold text-lg mb-3">Filter Jobs</h3>

      {/* Sector (maps to industry) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sector
        </label>
        <select
          value={filters.industry || ""}
          onChange={(e) => onFilterChange("industry", e.target.value)}
          className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select sector</option>
          {sectors.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Employment Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Types
        </label>
        <select
          value={filters.type || ""}
          onChange={(e) => onFilterChange("type", e.target.value)}
          className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select type</option>
          {jobTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Job Sites */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Sites
        </label>
        <select
          value={filters.jobSite || ""}
          onChange={(e) => onFilterChange("jobSite", e.target.value)}
          className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select site</option>
          {jobSites.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Experience Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Experience Level
        </label>
        <select
          value={filters.experienceLevel || ""}
          onChange={(e) => onFilterChange("experienceLevel", e.target.value)}
          className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select experience</option>
          {experienceLevels.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>

      {/* Education Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Education Level
        </label>
        <select
          value={filters.educationLevel || ""}
          onChange={(e) => onFilterChange("educationLevel", e.target.value)}
          className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select education</option>
          {educationLevels.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>

      {/* Gender Preference */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gender Preference
        </label>
        <select
          value={filters.genderPreference || ""}
          onChange={(e) => onFilterChange("genderPreference", e.target.value)}
          className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select gender</option>
          {genderPreferences.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* Clear button */}
      <button
        onClick={() => {
          onFilterChange("industry", "");
          onFilterChange("type", "");
          onFilterChange("jobSite", "");
          onFilterChange("experienceLevel", "");
          onFilterChange("educationLevel", "");
          onFilterChange("genderPreference", "");
        }}
        className="w-full mt-2 text-sm text-blue-600 hover:text-blue-800"
      >
        Clear all filters
      </button>
    </div>
  );
}
