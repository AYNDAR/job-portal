import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  FileText,
  MessageSquare,
} from "lucide-react";

interface Note {
  id: number;
  application_id: string;
  note_text: string;
  created_at: string;
  application?: {
    job: {
      title: string;
    };
    seeker: {
      full_name: string;
    };
  };
}

interface Application {
  id: string;
  job_title: string;
  applicant_name: string;
}

export default function NotesManagement() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editText, setEditText] = useState("");

  // Fetch all notes for employer (your backend should support this)
  const fetchNotes = async () => {
    try {
      const res = await api.get("/employer/notes");
      setNotes(res.data);
    } catch (error) {
      console.error("Failed to fetch notes", error);
      // Mock data
      setNotes([
        {
          id: 1,
          application_id: "app1",
          note_text: "Great candidate, strong React skills",
          created_at: new Date().toISOString(),
          application: {
            job: { title: "Frontend Developer" },
            seeker: { full_name: "John Doe" },
          },
        },
        {
          id: 2,
          application_id: "app2",
          note_text: "Schedule interview",
          created_at: new Date().toISOString(),
          application: {
            job: { title: "Backend Engineer" },
            seeker: { full_name: "Jane Smith" },
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await api.get("/employer/jobs/applications");
      setApplications(
        res.data.map((a: any) => ({
          id: a.id,
          job_title: a.job.title,
          applicant_name: a.seeker.full_name,
        })),
      );
    } catch (error) {
      console.error("Failed to fetch applications", error);
      setApplications([
        {
          id: "app1",
          job_title: "Frontend Developer",
          applicant_name: "John Doe",
        },
        {
          id: "app2",
          job_title: "Backend Engineer",
          applicant_name: "Jane Smith",
        },
      ]);
    }
  };

  useEffect(() => {
    fetchNotes();
    fetchApplications();
  }, []);

  const addNote = async () => {
    if (!selectedApp || !newNoteText.trim()) return;
    try {
      await api.post("/employer/notes", {
        application_id: selectedApp,
        note_text: newNoteText,
      });
      await fetchNotes();
      setShowAddModal(false);
      setNewNoteText("");
      setSelectedApp("");
    } catch (error) {
      console.error("Failed to add note", error);
      alert("Failed to add note");
    }
  };

  const updateNote = async () => {
    if (!editingNote || !editText.trim()) return;
    try {
      await api.put(`/employer/notes/${editingNote.id}`, {
        note_text: editText,
      });
      await fetchNotes();
      setEditingNote(null);
      setEditText("");
    } catch (error) {
      console.error("Failed to update note", error);
      alert("Failed to update note");
    }
  };

  const deleteNote = async (id: number) => {
    if (!confirm("Delete this note?")) return;
    try {
      await api.delete(`/employer/notes/${id}`);
      await fetchNotes();
    } catch (error) {
      console.error("Failed to delete note", error);
      alert("Failed to delete note");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading notes...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Notes Management</h2>
          <p className="text-sm text-gray-500">
            Manage your internal notes on candidates
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700"
        >
          <Plus size={16} /> Add Note
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500">
          <MessageSquare size={40} className="mx-auto mb-3 text-gray-300" />
          No notes yet. Click "Add Note" to create one.
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <FileText size={14} />
                    <span>{note.application?.job?.title || "Job"}</span>
                    <span>•</span>
                    <span>
                      {note.application?.seeker?.full_name || "Candidate"}
                    </span>
                    <span>•</span>
                    <span>{new Date(note.created_at).toLocaleString()}</span>
                  </div>
                  {editingNote?.id === note.id ? (
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      rows={3}
                      autoFocus
                    />
                  ) : (
                    <p className="text-gray-700 whitespace-pre-line">
                      {note.note_text}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  {editingNote?.id === note.id ? (
                    <>
                      <button
                        onClick={updateNote}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingNote(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingNote(note);
                          setEditText(note.note_text);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Note Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Add Note</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Application
                </label>
                <select
                  value={selectedApp}
                  onChange={(e) => setSelectedApp(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2"
                >
                  <option value="">Select application</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.job_title} - {app.applicant_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 resize-none"
                  placeholder="Write your internal note here..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={addNote}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
