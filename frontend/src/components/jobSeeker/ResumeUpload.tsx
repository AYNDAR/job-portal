import { useState } from "react";
import api from "../../services/api";
import { useAppSelector } from "../../store/hooks";

export default function ResumeUpload() {
  useAppSelector((state) => state.auth);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Select a file first");
      return;
    }
    const formData = new FormData();
    formData.append("resume", file);
    setUploading(true);
    setError("");
    setMessage("");
    try {
      await api.post("/user/upload/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Resume uploaded successfully!");
      setFile(null);
      // Clear file input
      const input = document.getElementById("resume-file") as HTMLInputElement;
      if (input) input.value = "";
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Upload Resume</h3>
      <div className="mb-3">
        <label
          htmlFor="resume-file"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Choose file (PDF or DOCX, max 5MB)
        </label>
        <input
          id="resume-file"
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload Resume"}
      </button>
      {message && <p className="mt-2 text-sm text-green-600">{message}</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
