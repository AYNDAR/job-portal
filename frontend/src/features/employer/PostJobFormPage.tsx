/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../services/api";
import { useAppSelector } from "../../store/hooks";
import {
  Briefcase,
  DollarSign,
  MapPin,
  FileText,
  Sparkles,
  Eye,
  CheckCircle,
  AlertCircle,
  Send,
} from "lucide-react";

const jobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  industry_id: z.number().min(1, "Select an industry"),
  employment_type_id: z.number().min(1, "Select employment type"),
  salary_range: z.string().optional(),
  jobSite: z.string().optional(),
  experienceLevel: z.string().optional(),
  educationLevel: z.string().optional(),
  genderPreference: z.string().optional(),
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

  const industryOptions = [
    { value: 1, label: "Technology" },
    { value: 2, label: "Healthcare" },
    { value: 3, label: "Finance" },
    { value: 4, label: "Education" },
    { value: 5, label: "Retail" },
  ];

  const employmentOptions = [
    { value: 1, label: "Full-time" },
    { value: 2, label: "Part-time" },
    { value: 3, label: "Remote" },
    { value: 4, label: "Contract" },
    { value: 5, label: "Internship" },
  ];

  const jobSiteOptions = [
    { value: "Onsite", label: "Onsite" },
    { value: "Remote", label: "Remote" },
    { value: "Hybrid", label: "Hybrid" },
  ];

  const experienceOptions = [
    { value: "Junior", label: "Junior" },
    { value: "Mid", label: "Mid Level" },
    { value: "Senior", label: "Senior" },
    { value: "Lead", label: "Lead / Manager" },
  ];

  const educationOptions = [
    { value: "High School", label: "High School" },
    { value: "Bachelor", label: "Bachelor Degree" },
    { value: "Master", label: "Master Degree" },
    { value: "PhD", label: "PhD" },
  ];

  const genderOptions = [
    { value: "Any", label: "Any" },
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT SIDE */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {/* HEADER */}
          <div className="border-b border-gray-100 px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>

            <p className="text-gray-500 mt-2">
              Create a professional job listing to attract top candidates.
            </p>
          </div>

          <div className="p-8">
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-2xl p-4 flex items-center gap-3">
                <CheckCircle className="h-5 w-5" />
                {success}
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
              {/* JOB DETAILS */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-lg text-gray-900">
                      Job Details
                    </h2>

                    <p className="text-sm text-gray-500">
                      Basic information about the role
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* JOB TITLE */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title *
                    </label>

                    <input
                      {...register("title")}
                      placeholder="e.g. Senior Frontend Developer"
                      className="w-full h-14 rounded-2xl border border-gray-200 px-5 outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {errors.title && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  {/* GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* INDUSTRY */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Industry *
                      </label>

                      <select
                        {...register("industry_id", {
                          valueAsNumber: true,
                        })}
                        className="w-full h-14 rounded-2xl border border-gray-200 px-5 outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Industry</option>

                        {industryOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* EMPLOYMENT TYPE */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employment Type *
                      </label>

                      <select
                        {...register("employment_type_id", {
                          valueAsNumber: true,
                        })}
                        className="w-full h-14 rounded-2xl border border-gray-200 px-5 outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Type</option>

                        {employmentOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* JOB SITE */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Job Site
                      </label>

                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                        <select
                          {...register("jobSite")}
                          className="w-full h-14 rounded-2xl border border-gray-200 pl-11 pr-5 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Mode</option>

                          {jobSiteOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* SALARY */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Salary Range
                      </label>

                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                        <input
                          {...register("salary_range")}
                          placeholder="$80k - $120k"
                          className="w-full h-14 rounded-2xl border border-gray-200 pl-11 pr-5 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-lg text-gray-900">
                      Job Description
                    </h2>

                    <p className="text-sm text-gray-500">
                      Explain responsibilities and requirements
                    </p>
                  </div>
                </div>

                <textarea
                  {...register("description")}
                  rows={8}
                  placeholder="Describe the role, responsibilities, requirements, benefits..."
                  className="w-full rounded-2xl border border-gray-200 px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500"
                />

                {errors.description && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* EXTRA FILTERS */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-orange-600" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-lg text-gray-900">
                      Additional Filters
                    </h2>

                    <p className="text-sm text-gray-500">
                      Optional candidate preferences
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <select
                    {...register("experienceLevel")}
                    className="w-full h-14 rounded-2xl border border-gray-200 px-5 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Experience Level</option>

                    {experienceOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <select
                    {...register("educationLevel")}
                    className="w-full h-14 rounded-2xl border border-gray-200 px-5 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Education Level</option>

                    {educationOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <select
                    {...register("genderPreference")}
                    className="w-full h-14 rounded-2xl border border-gray-200 px-5 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Gender Preference</option>

                    {genderOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* FOOTER */}
              <div className="border-t border-gray-100 pt-6 flex justify-between items-center">
                <button
                  type="button"
                  className="px-6 py-3 rounded-2xl border border-gray-200 font-medium hover:bg-gray-50 transition"
                >
                  Save Draft
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 transition-all"
                >
                  {loading ? (
                    "Posting..."
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Publish Job
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">
          {/* HIGHLIGHTS */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-yellow-600" />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Job Highlights</h3>

                <p className="text-sm text-gray-500">
                  Make your post stand out
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-600">
                Flexible working hours
              </div>

              <div className="border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-600">
                Health insurance
              </div>

              <div className="border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-600">
                Career growth opportunities
              </div>
            </div>
          </div>

          {/* PREVIEW */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Preview</h3>

                <p className="text-sm text-gray-500">
                  See how candidates view your job
                </p>
              </div>
            </div>

            <button
              type="button"
              className="w-full h-12 rounded-2xl border border-blue-200 text-blue-600 font-medium hover:bg-blue-50 transition"
            >
              Preview Job Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
