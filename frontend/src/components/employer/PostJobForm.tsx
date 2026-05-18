/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../services/api";
import { useAppSelector } from "../../store/hooks";
import {
  Briefcase,
  MapPin,
  DollarSign,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const jobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  industry_id: z.number().min(1, "Select an industry"),
  employment_type_id: z.number().min(1, "Select employment type"),
  salary_range: z.string().optional(),
  location: z.string().optional(),
  experienceLevel: z.string().optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

interface PostJobFormProps {
  onSuccess?: () => void;
}

export default function PostJobForm({ onSuccess }: PostJobFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const { token } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
  });

  const onSubmit = async (data: JobFormData) => {
    if (!token) {
      setError("You must be logged in");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/employer/jobs", data);
      setSuccess("Job posted successfully!");
      reset();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  const industries = [
    { value: 1, label: "Technology" },
    { value: 2, label: "Healthcare" },
    { value: 3, label: "Finance" },
    { value: 4, label: "Education" },
    { value: 5, label: "Retail" },
  ];
  const employmentTypes = [
    { value: 1, label: "Full-time" },
    { value: 2, label: "Part-time" },
    { value: 3, label: "Remote" },
    { value: 4, label: "Contract" },
    { value: 5, label: "Internship" },
  ];
  const experienceLevels = [
    { value: "", label: "Select experience" },
    { value: "Junior", label: "Junior (1-3 years)" },
    { value: "Mid", label: "Mid (3-5 years)" },
    { value: "Senior", label: "Senior (5+ years)" },
    { value: "Lead", label: "Lead/Manager" },
  ];
  const locations = [
    { value: "", label: "Select location type" },
    { value: "Onsite", label: "Onsite" },
    { value: "Remote", label: "Remote" },
    { value: "Hybrid", label: "Hybrid" },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Post a New Job</h2>
          <p className="text-blue-100 text-sm">Fill in the details below</p>
        </div>

        <div className="p-6">
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>{success}</span>
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register("title")}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Senior Frontend Developer"
                />
              </div>
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Industry & Employment Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry *
                </label>
                <select
                  {...register("industry_id", { valueAsNumber: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select industry</option>
                  {industries.map((ind) => (
                    <option key={ind.value} value={ind.value}>
                      {ind.label}
                    </option>
                  ))}
                </select>
                {errors.industry_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.industry_id.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Type *
                </label>
                <select
                  {...register("employment_type_id", { valueAsNumber: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select type</option>
                  {employmentTypes.map((et) => (
                    <option key={et.value} value={et.value}>
                      {et.label}
                    </option>
                  ))}
                </select>
                {errors.employment_type_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.employment_type_id.message}
                  </p>
                )}
              </div>
            </div>

            {/* Location, Experience, Salary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    {...register("location")}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {locations.map((loc) => (
                      <option key={loc.value} value={loc.value}>
                        {loc.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level
                </label>
                <select
                  {...register("experienceLevel")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {experienceLevels.map((exp) => (
                    <option key={exp.value} value={exp.value}>
                      {exp.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary Range
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...register("salary_range")}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., $60k - $80k"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Description *
              </label>
              <textarea
                {...register("description")}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the role, responsibilities, requirements, and benefits..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Minimum 50 characters. Be specific to attract the right
                candidates.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? "Posting..." : "Post Job"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
