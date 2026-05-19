import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../services/api";
import { useAppSelector } from "../../store/hooks";
import {
  CheckCircle,
  AlertCircle,
  Briefcase,
  DollarSign,
  Clock,
  Users,
  Upload,
} from "lucide-react";

const jobSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  industry_id: z.number().min(1, "Select an industry"),
  employment_type_id: z.number().min(1, "Select employment type"),
  location: z.string().optional(),
  budget_type: z.enum(["hourly", "fixed"]),
  budget_min: z.number().min(0, "Budget minimum is required"),
  budget_max: z.number().optional(),
  duration: z.string().optional(),
  experience_level: z.enum(["Entry", "Intermediate", "Expert"]),
  skills: z.string().optional(),
  require_resume: z.boolean().default(false),
});

type JobFormData = z.infer<typeof jobSchema>;

export default function PostJobForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const { token } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      budget_type: "hourly",
      experience_level: "Intermediate",
      require_resume: false,
    },
  });
  const budgetType = watch("budget_type");

  const onSubmit = async (data: JobFormData) => {
    if (!token) {
      setError("You must be logged in");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const skillsArray = data.skills
        ? data.skills.split(",").map((s) => s.trim())
        : [];
      const payload = {
        title: data.title,
        description: data.description,
        industry_id: data.industry_id,
        employment_type_id: data.employment_type_id,
        location: data.location,
        budget_type: data.budget_type,
        budget_min: data.budget_min,
        budget_max: data.budget_max,
        duration: data.duration,
        experience_level: data.experience_level,
        skills: skillsArray,
        require_resume: data.require_resume,
        salary_range:
          data.budget_type === "hourly"
            ? `$${data.budget_min}/hr${data.budget_max ? ` - $${data.budget_max}/hr` : ""}`
            : `$${data.budget_min}${data.budget_max ? ` - $${data.budget_max}` : ""}`,
      };
      await api.post("/employer/jobs", payload);
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Post a New Job</h2>
          <p className="text-blue-100 text-sm">
            Fill in the details – it takes only a few minutes
          </p>
        </div>
        <div className="p-6">
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
              <CheckCircle className="h-4 w-4" />
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register("title")}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Front End Developer Needed for Web Application Enhancement"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                {...register("location")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Remote / New York"
              />
            </div>
            {/* Budget Section */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-4 mb-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="hourly"
                    {...register("budget_type")}
                  />{" "}
                  Hourly
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="fixed"
                    {...register("budget_type")}
                  />{" "}
                  Fixed Price
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {budgetType === "hourly"
                      ? "Hourly Rate (USD)"
                      : "Fixed Amount (USD)"}{" "}
                    *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      {...register("budget_min", { valueAsNumber: true })}
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg"
                      placeholder={
                        budgetType === "hourly" ? "e.g., 20" : "e.g., 500"
                      }
                    />
                  </div>
                  {errors.budget_min && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.budget_min.message}
                    </p>
                  )}
                </div>
                {budgetType === "hourly" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Max Hourly Rate (optional)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        {...register("budget_max", { valueAsNumber: true })}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="e.g., 25"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Duration & Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    {...register("duration")}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select duration</option>
                    <option value="Less than 1 month">Less than 1 month</option>
                    <option value="1-3 months">1-3 months</option>
                    <option value="3-6 months">3-6 months</option>
                    <option value="More than 6 months">
                      More than 6 months
                    </option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    {...register("experience_level")}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Entry">Entry Level</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>
            </div>
            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills (comma separated)
              </label>
              <input
                {...register("skills")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., HTML, CSS, JavaScript, React"
              />
            </div>
            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Description *
              </label>
              <textarea
                {...register("description")}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Describe the project, responsibilities, requirements, and what you're looking for..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Minimum 50 characters. Be specific.
              </p>
            </div>
            {/* Resume Requirement */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register("require_resume")}
                className="rounded border-gray-300"
              />
              <label className="text-sm text-gray-700">
                Require applicants to upload a resume
              </label>
            </div>
            {/* Submit */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
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
