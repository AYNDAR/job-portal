import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  Briefcase,
  MapPin,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface FormData {
  title: string;
  description: string;
  industry_id: number;
  employment_type_id: number;
  salary_range: string;
  location: string;
}

export default function PostJobForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormData>({
    title: "",
    description: "",
    industry_id: 0,
    employment_type_id: 0,
    salary_range: "",
    location: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    // Validation
    if (!form.title.trim()) {
      setError("Job title is required");
      setLoading(false);
      return;
    }
    if (!form.description.trim() || form.description.length < 50) {
      setError("Description must be at least 50 characters");
      setLoading(false);
      return;
    }
    if (!form.industry_id) {
      setError("Please select an industry");
      setLoading(false);
      return;
    }
    if (!form.employment_type_id) {
      setError("Please select an employment type");
      setLoading(false);
      return;
    }
    if (!form.location.trim()) {
      setError("Location is required");
      setLoading(false);
      return;
    }

    try {
      await api.post("/employer/jobs", {
        title: form.title,
        description: form.description,
        industry_id: form.industry_id,
        employment_type_id: form.employment_type_id,
        salary_range: form.salary_range || "Not specified",
        location: form.location,
      });
      setSuccess(true);
      setTimeout(() => navigate("/employer/dashboard"), 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to post job. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const industries = [
    { id: 1, name: "Technology" },
    { id: 2, name: "Healthcare" },
    { id: 3, name: "Finance" },
    { id: 4, name: "Education" },
    { id: 5, name: "Retail" },
    { id: 6, name: "Manufacturing" },
    { id: 7, name: "Construction" },
    { id: 8, name: "Marketing" },
    { id: 9, name: "Design" },
  ];

  const employmentTypes = [
    { id: 1, name: "Full-time" },
    { id: 2, name: "Part-time" },
    { id: 3, name: "Remote" },
    { id: 4, name: "Contract" },
    { id: 5, name: "Internship" },
  ];

  if (success) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-5">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Job posted successfully!
        </h2>
        <p className="text-gray-500 text-sm">
          Redirecting to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Briefcase size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Post a New Job
              </h2>
              <p className="text-xs text-purple-200 mt-0.5">
                Fill in the details below to create a job posting
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-100"
              placeholder="e.g., Senior Frontend Developer"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={6}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-100 resize-none"
              placeholder="Describe the role, responsibilities, requirements, and benefits..."
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              {form.description.length} characters (minimum 50)
            </p>
          </div>

          {/* Industry & Employment Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry <span className="text-red-500">*</span>
              </label>
              <select
                name="industry_id"
                value={form.industry_id}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-100 bg-white"
                required
              >
                <option value={0}>Select industry</option>
                {industries.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Type <span className="text-red-500">*</span>
              </label>
              <select
                name="employment_type_id"
                value={form.employment_type_id}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-100 bg-white"
                required
              >
                <option value={0}>Select type</option>
                {employmentTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Salary Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salary Range
            </label>
            <div className="relative">
              <DollarSign
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                name="salary_range"
                value={form.salary_range}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100"
                placeholder="e.g., $60k - $80k or Negotiable"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100"
                placeholder="City, Country or Remote"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold px-6 py-2 rounded-xl transition shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  <CheckCircle size={16} /> Publish Job
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
