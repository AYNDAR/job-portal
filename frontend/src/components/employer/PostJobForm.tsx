import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../services/api";
import { useAppSelector } from "../../store/hooks";

const jobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  industry_id: z.number().min(1, "Select an industry"),
  employment_type_id: z.number().min(1, "Select employment type"),
  salary_range: z.string().optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

export default function PostJobForm() {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Post a New Job</h2>
      {success && (
        <div className="bg-green-100 text-green-700 p-2 rounded mb-4">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Job Title
          </label>
          <input
            {...register("title")}
            className="mt-1 w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={6}
            className="mt-1 w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Industry
          </label>
          <select
            {...register("industry_id", { valueAsNumber: true })}
            className="mt-1 w-full border rounded-md p-2"
          >
            <option value="">Select industry</option>
            <option value="1">Technology</option>
            <option value="2">Healthcare</option>
            <option value="3">Finance</option>
            <option value="4">Education</option>
            <option value="5">Retail</option>
          </select>
          {errors.industry_id && (
            <p className="text-red-500 text-sm">{errors.industry_id.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Employment Type
          </label>
          <select
            {...register("employment_type_id", { valueAsNumber: true })}
            className="mt-1 w-full border rounded-md p-2"
          >
            <option value="">Select type</option>
            <option value="1">Full-time</option>
            <option value="2">Part-time</option>
            <option value="3">Remote</option>
            <option value="4">Contract</option>
            <option value="5">Internship</option>
          </select>
          {errors.employment_type_id && (
            <p className="text-red-500 text-sm">
              {errors.employment_type_id.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Salary Range (e.g., $50k – $70k)
          </label>
          <input
            {...register("salary_range")}
            className="mt-1 w-full border rounded-md p-2"
            placeholder="Optional"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Posting..." : "Post Job"}
        </button>
      </form>
    </div>
  );
}
