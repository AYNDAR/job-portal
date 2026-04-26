interface JobFiltersProps {
  filters: {
    industry: string;
    type: string;
    salary: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export default function JobFilters({
  filters,
  onFilterChange,
}: JobFiltersProps) {
  const categories = [
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

  return (
    <aside className="space-y-6">
      {/* Category */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="font-semibold mb-3">Category</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.industry === cat}
                onChange={(e) =>
                  onFilterChange("industry", e.target.checked ? cat : "")
                }
                className="rounded"
                aria-label={`Filter by ${cat}`}
              />
              {cat}
            </label>
          ))}
        </div>
      </div>

      {/* Employment Type */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="font-semibold mb-3">Employment Type</h3>
        <div className="space-y-2">
          {employmentTypes.map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="employmentType"
                checked={filters.type === type}
                onChange={(e) =>
                  onFilterChange("type", e.target.checked ? type : "")
                }
                className="rounded"
                aria-label={`Employment type: ${type}`}
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="font-semibold mb-3">Salary Range (USD)</h3>
        <input
          type="range"
          min="0"
          max="200"
          value={parseInt(filters.salary) || 0}
          onChange={(e) => onFilterChange("salary", e.target.value)}
          className="w-full"
          aria-label="Salary range filter"
        />
        <div className="flex justify-between text-sm mt-2">
          <span>$0k</span>
          <span>$200k+</span>
        </div>
      </div>
    </aside>
  );
}
