import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import api from "../../services/api";

export default function ApplyForm() {
  const { id: jobId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useAppSelector((state) => state.auth);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!token || user?.userType !== "Job Seeker") {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Please login as a job seeker to apply.</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/applications", { jobId, coverLetter });
      alert("Application submitted successfully!");
      navigate(`/jobs/${jobId}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Apply for this position</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Letter (Optional)
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tell the employer why you're a great fit..."
            />
          </div>
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
