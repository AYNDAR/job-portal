interface JobSearchBarProps {
  title: string;
  location: string;
  onTitleChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
}

export default function JobSearchBar({
  title,
  location,
  onTitleChange,
  onLocationChange,
  onSearch,
}: JobSearchBarProps) {
  return (
    <div className="bg-linear-to-r from-blue-600 to-blue-800 rounded-2xl p-8 mb-8 text-white">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">
        Find Your Dream Job
      </h1>
      <p className="text-lg mb-6">
        Search and apply for the latest job openings.
      </p>
      <form onSubmit={onSearch} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Job title, keywords, or company"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <div className="flex-1">
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <button
          type="submit"
          className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Search
        </button>
      </form>
    </div>
  );
}
