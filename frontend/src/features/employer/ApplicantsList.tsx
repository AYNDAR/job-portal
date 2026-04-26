import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAppSelector } from "../../store/hooks";
import { EmployerApplication } from "./types";

interface ApplicantsListProps {
  jobId: string;
}

export default function ApplicantsList({ jobId }: ApplicantsListProps) {
  const [applications, setApplications] = useState<EmployerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { token } = useAppSelector((state) => state.auth);

  const fetchApplicants = async () => {
    try {
      const res = await api.get(`/employer/jobs/${jobId}/applicants`);
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && jobId) fetchApplicants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, jobId]);

  const updateStatus = async (applicationId: string, newStatus: string) => {
    setUpdating(applicationId);
    try {
      await api.patch(`/employer/applications/${applicationId}/status`, {
        statusName: newStatus,
      });
      await fetchApplicants();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const addNote = async (applicationId: string, noteText: string) => {
    await api.post(`/employer/applications/${applicationId}/notes`, {
      noteText,
    });
    fetchApplicants();
  };

  if (loading) return <div>Loading applicants...</div>;
  if (applications.length === 0)
    return <div>No applicants for this job yet.</div>;

  return (
    <div className="space-y-6">
      {applications.map((app) => (
        <div key={app.id} className="bg-white p-4 rounded-lg shadow-md border">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{app.seeker.full_name}</h3>
              <p className="text-sm text-gray-500">{app.seeker.email}</p>
              {app.seeker.resume_url && (
                <a
                  href={app.seeker.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm block mt-1"
                >
                  View Resume
                </a>
              )}
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-200">
                {app.status.status_name}
              </span>
              <div className="mt-2">
                <select
                  value={app.status.status_name}
                  onChange={(e) => updateStatus(app.id, e.target.value)}
                  disabled={updating === app.id}
                  className="text-sm border rounded p-1"
                >
                  <option value="Pending">Pending</option>
                  <option value="Interview">Interview</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
          {app.cover_letter && (
            <div className="mt-2 p-2 bg-gray-50 rounded">
              <p className="text-sm">
                <strong>Cover letter:</strong> {app.cover_letter}
              </p>
            </div>
          )}
          <div className="mt-3">
            <details>
              <summary className="text-sm cursor-pointer text-blue-600">
                Notes ({app.notes.length})
              </summary>
              <div className="mt-2 space-y-2">
                {app.notes.map((note, idx) => (
                  <div key={idx} className="text-sm border-l-2 pl-2">
                    <p>{note.note_text}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(note.created_at).toLocaleString()} –{" "}
                      {note.employer.company_name}
                    </p>
                  </div>
                ))}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const input = form.elements.namedItem(
                      "note",
                    ) as HTMLInputElement;
                    if (input.value.trim()) addNote(app.id, input.value);
                    input.value = "";
                  }}
                  className="flex gap-2 mt-2"
                >
                  <input
                    name="note"
                    placeholder="Add a private note..."
                    className="flex-1 border rounded p-1 text-sm"
                  />
                  <button type="submit" className="text-blue-600 text-sm">
                    Add
                  </button>
                </form>
              </div>
            </details>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Applied: {new Date(app.applied_at).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}
