/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import api from "../../services/api";
import {
  FileText,
  Upload,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Briefcase,
  Home,
  Loader2,
} from "lucide-react";

export default function ApplyForm() {
  const { id: jobId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAppSelector((state) => state.auth);

  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [hasResume, setHasResume] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    if (!jobId || !token) return;

    // Fetch job details
    api
      .get(`/jobs/${jobId}`)
      .then((res) => {
        setJobTitle(res.data.title || "");
        setCompanyName(res.data.employer?.company_name || "");
      })
      .catch(() => {});

    // Fetch user profile to check existing resume
    api
      .get("/jobseeker/profile")
      .then((res) => {
        const url = res.data.resume_url || res.data.resumeUrl || "";
        if (url) {
          setHasResume(true);
          setResumeUrl(url);
        }
      })
      .catch(() => {});

    // Check if already applied — try both common endpoints
    api
      .get(`/applications/check/${jobId}`)
      .then((res) => {
        if (res.data.applied) setAlreadyApplied(true);
      })
      .catch(() => {
        // fallback: fetch all applications and check
        api
          .get("/applications/my-applications")
          .catch(() => api.get("/applications"))
          .then((res: any) => {
            const apps = Array.isArray(res.data)
              ? res.data
              : res.data.applications || [];
            const found = apps.some(
              (a: any) =>
                String(a.job_id) === String(jobId) ||
                String(a.jobId) === String(jobId) ||
                String(a.job?.id) === String(jobId),
            );
            if (found) setAlreadyApplied(true);
          })
          .catch(() => {});
      });
  }, [jobId, token]);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type)) {
      setError("Please upload a PDF or Word document");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setUploadingResume(true);
    setError("");

    const fd = new FormData();
    fd.append("resume", file);

    try {
      // Try both common resume upload endpoints
      let url = "";
      try {
        const res = await api.post("/user/upload/resume", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        url = res.data.url || res.data.resume_url || res.data.resumeUrl || "";
      } catch {
        const res = await api.post("/jobseeker/resume", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        url = res.data.url || res.data.resume_url || res.data.resumeUrl || "";
      }

      if (!url) throw new Error("No URL returned from server");
      setResumeUrl(url);
      setHasResume(true);
      setSuccess("Resume uploaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || "Failed to upload resume",
      );
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasResume || !resumeUrl) {
      setError("Please upload your resume before applying");
      return;
    }
    if (alreadyApplied) {
      setError("You have already applied for this job");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Send jobId, coverLetter AND resume_url so the backend links them
      await api.post("/applications", {
        jobId,
        job_id: jobId, // send both forms in case backend expects either
        coverLetter,
        cover_letter: coverLetter,
        resume_url: resumeUrl,
        resumeUrl,
      });
      setSuccess("Application submitted successfully! Redirecting...");
      setAlreadyApplied(true);
      setTimeout(() => navigate("/my-applications"), 2000);
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to submit application";
      // Handle duplicate application error gracefully
      if (
        err.response?.status === 409 ||
        msg.toLowerCase().includes("already")
      ) {
        setAlreadyApplied(true);
        setError("You have already applied for this job.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Navigation */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 bg-white px-3 py-2 rounded-xl hover:bg-gray-50 transition"
          >
            <ArrowLeft size={15} /> Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 bg-white px-3 py-2 rounded-xl hover:bg-gray-50 transition"
          >
            <Home size={15} /> Home
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-blue-600 to-indigo-700 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Briefcase size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Apply for this position
                </h1>
                {jobTitle && (
                  <p className="text-blue-100 text-sm mt-0.5">
                    {jobTitle}
                    {companyName && ` at ${companyName}`}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Already applied banner */}
            {alreadyApplied && !success && (
              <div className="mb-5 flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-3 text-sm">
                <CheckCircle size={16} />
                You have already applied for this job.{" "}
                <button
                  onClick={() => navigate("/my-applications")}
                  className="underline font-medium ml-1"
                >
                  View your applications
                </button>
              </div>
            )}

            {success && (
              <div className="mb-5 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
                <CheckCircle size={16} /> {success}
              </div>
            )}
            {error && (
              <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Resume */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex items-start gap-3">
                  <FileText
                    size={20}
                    className="text-blue-500 mt-0.5 shrink-0"
                  />
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Resume / CV <span className="text-red-500">*</span>
                    </label>
                    {hasResume ? (
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm text-green-700 bg-green-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                          <CheckCircle size={13} /> Resume ready
                        </span>
                        {resumeUrl && (
                          <a
                            href={resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Preview
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setHasResume(false);
                            setResumeUrl("");
                          }}
                          className="text-sm text-gray-500 hover:text-red-500 transition"
                        >
                          Replace
                        </button>
                      </div>
                    ) : (
                      <div>
                        <label className="flex flex-col items-center justify-center w-full p-5 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition bg-white group">
                          {uploadingResume ? (
                            <Loader2
                              size={24}
                              className="text-blue-500 mb-2 animate-spin"
                            />
                          ) : (
                            <Upload
                              size={24}
                              className="text-gray-400 mb-2 group-hover:text-blue-500 transition"
                            />
                          )}
                          <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition">
                            {uploadingResume
                              ? "Uploading..."
                              : "Click to upload PDF or Word doc"}
                          </span>
                          <span className="text-xs text-gray-400 mt-1">
                            Max 5MB
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleResumeUpload}
                            disabled={uploadingResume}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Cover Letter{" "}
                  <span className="text-gray-400 text-xs font-normal">
                    (Optional)
                  </span>
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5}
                  placeholder="Tell the employer why you're a great fit for this role..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition resize-none text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {coverLetter.length} characters
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={
                    loading ||
                    uploadingResume ||
                    (!hasResume && !resumeUrl) ||
                    alreadyApplied
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition shadow-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />{" "}
                      Submitting...
                    </>
                  ) : alreadyApplied ? (
                    "Already Applied"
                  ) : (
                    "Submit Application"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
