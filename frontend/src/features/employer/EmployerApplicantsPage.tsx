import { useEffect, useState } from "react";
import api from "../../services/api";
import type { Job, Application } from "./types";
import {
  Users,
  Search,
  Download,
  ChevronDown,
  ExternalLink,
  FileText,
  ChevronRight,
  Star,
  Mail,
  Filter,
  Loader2,
  CheckCircle,
  Calendar,
  User,
  Phone,
  MapPin,
  Code,
  Clock,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Interview: "bg-blue-50 text-blue-700 border-blue-200",
    Accepted: "bg-green-50 text-green-700 border-green-200",
    Rejected: "bg-red-50 text-red-600 border-red-200",
    Shortlisted: "bg-violet-50 text-violet-700 border-violet-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}
    >
      {status}
    </span>
  );
}

const avatarColors = [
  "bg-purple-100 text-purple-600",
  "bg-blue-100 text-blue-600",
  "bg-green-100 text-green-600",
  "bg-amber-100 text-amber-600",
  "bg-rose-100 text-rose-600",
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function EmployerApplicantsPage() {
  const token = localStorage.getItem("token");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelected] = useState("");
  const [applications, setApps] = useState<Application[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedId, setExpanded] = useState<string | null>(null);
  const [newNote, setNewNote] = useState<Record<string, string>>({});
  const [starred, setStarred] = useState<Set<string>>(new Set());

  // New state for modals
  const [profileModal, setProfileModal] = useState<Application | null>(null);
  const [interviewModal, setInterviewModal] = useState<{
    app: Application;
    date?: string;
    time?: string;
  } | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .get("/employer/jobs")
      .then((r) => {
        setJobs(r.data);
        if (r.data.length > 0) setSelected(r.data[0].id);
      })
      .finally(() => setLoadingJobs(false));
  }, [token]);

  useEffect(() => {
    if (!selectedJobId) return;
    setLoadingApps(true);
    api
      .get(`/employer/jobs/${selectedJobId}/applicants`)
      .then((r) => setApps(r.data))
      .catch(console.error)
      .finally(() => setLoadingApps(false));
  }, [selectedJobId]);

  const updateStatus = async (appId: string, status: string) => {
    setUpdating(appId);
    try {
      await api.patch(`/employer/applications/${appId}/status`, {
        statusName: status,
      });
      setApps((prev) =>
        prev.map((a) =>
          a.id === appId ? { ...a, status: { status_name: status } } : a,
        ),
      );
    } finally {
      setUpdating(null);
    }
  };

  const addNote = async (appId: string) => {
    const text = newNote[appId]?.trim();
    if (!text) return;
    await api.post(`/employer/applications/${appId}/notes`, { noteText: text });
    setNewNote((prev) => ({ ...prev, [appId]: "" }));
    const r = await api.get(`/employer/jobs/${selectedJobId}/applicants`);
    setApps(r.data);
  };

  const exportCSV = async () => {
    if (!selectedJobId) return;
    const r = await api.get(`/employer/jobs/${selectedJobId}/export`, {
      responseType: "blob",
    });
    const url = URL.createObjectURL(new Blob([r.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = `applicants_${selectedJobId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadResume = (url: string, fileName: string) => {
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      })
      .catch(console.error);
  };

  const scheduleInterview = (app: Application) => {
    setInterviewModal({ app });
  };

  const confirmInterview = () => {
    if (!interviewModal) return;
    const { app, date, time } = interviewModal;
    if (!date || !time) {
      alert("Please select date and time");
      return;
    }
    // Here you would call API to schedule interview, e.g.:
    // await api.post(`/employer/applications/${app.id}/schedule-interview`, { date, time });
    alert(
      `Interview scheduled for ${app.seeker.full_name} on ${date} at ${time}`,
    );
    setInterviewModal(null);
  };

  const toggleStar = (id: string) => {
    setStarred((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const filtered = applications.filter((a) => {
    const matchSearch =
      a.seeker.full_name.toLowerCase().includes(search.toLowerCase()) ||
      a.seeker.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All" || a.status.status_name === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: applications.length,
    pending: applications.filter((a) => a.status.status_name === "Pending")
      .length,
    shortlisted: applications.filter((a) =>
      ["Shortlisted", "Interview"].includes(a.status.status_name),
    ).length,
    accepted: applications.filter((a) => a.status.status_name === "Accepted")
      .length,
    rejected: applications.filter((a) => a.status.status_name === "Rejected")
      .length,
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Applicants</h2>
          <p className="text-sm text-gray-500">
            Review, rank and manage your candidates
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={!selectedJobId || applications.length === 0}
          className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium px-4 py-2 rounded-xl transition disabled:opacity-40 shadow-sm"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Job Post
            </label>
            {loadingJobs ? (
              <div className="h-9 bg-gray-100 rounded-lg animate-pulse" />
            ) : (
              <div className="relative">
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelected(e.target.value)}
                  className="w-full appearance-none text-sm border border-gray-200 rounded-xl px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-100 bg-white cursor-pointer"
                >
                  <option value="">Select a job...</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Search
            </label>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name or email..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Filter by Status
            </label>
            <div className="relative">
              <Filter
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none text-sm border border-gray-200 rounded-xl pl-8 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-purple-100 bg-white cursor-pointer"
              >
                {[
                  "All",
                  "Pending",
                  "Shortlisted",
                  "Interview",
                  "Accepted",
                  "Rejected",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {!loadingApps && applications.length > 0 && (
        <div className="grid grid-cols-5 gap-3">
          {[
            {
              label: "Total",
              count: counts.total,
              color: "text-gray-700",
              bg: "bg-gray-50",
            },
            {
              label: "Pending",
              count: counts.pending,
              color: "text-yellow-600",
              bg: "bg-yellow-50",
            },
            {
              label: "Shortlisted",
              count: counts.shortlisted,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Accepted",
              count: counts.accepted,
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              label: "Rejected",
              count: counts.rejected,
              color: "text-red-500",
              bg: "bg-red-50",
            },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() =>
                setStatusFilter(s.label === "Total" ? "All" : s.label)
              }
              className={`${s.bg} rounded-xl border border-gray-100 p-3 text-center hover:opacity-90 transition cursor-pointer`}
            >
              <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </button>
          ))}
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {!selectedJobId ? (
          <div className="py-16 text-center">
            <Users size={36} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-500">
              Select a job to view applicants
            </p>
          </div>
        ) : loadingApps ? (
          <div className="py-8 flex items-center justify-center gap-2 text-gray-400">
            <Loader2 size={18} className="animate-spin" /> Loading applicants...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={36} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-500">No applicants found</p>
            {statusFilter !== "All" && (
              <button
                onClick={() => setStatusFilter("All")}
                className="mt-2 text-xs text-purple-500 underline"
              >
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-2 px-5 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <span className="col-span-1"></span>
              <span className="col-span-4">Candidate</span>
              <span className="col-span-2">Applied</span>
              <span className="col-span-2">Status</span>
              <span className="col-span-2">Actions</span>
              <span className="col-span-1"></span>
            </div>

            <div className="divide-y divide-gray-50">
              {filtered.map((app, idx) => (
                <div key={app.id}>
                  <div className="grid grid-cols-12 gap-2 items-center px-5 py-3.5 hover:bg-gray-50 transition group">
                    <div className="col-span-1 flex items-center justify-center">
                      <button
                        onClick={() => toggleStar(app.id)}
                        className={`transition ${starred.has(app.id) ? "text-amber-400" : "text-gray-200 hover:text-amber-300"}`}
                      >
                        <Star
                          size={15}
                          fill={starred.has(app.id) ? "currentColor" : "none"}
                        />
                      </button>
                    </div>

                    <div className="col-span-4 flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${avatarColors[idx % avatarColors.length]}`}
                      >
                        {initials(app.seeker.full_name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {app.seeker.full_name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {app.seeker.email}
                        </p>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">
                        {new Date(app.applied_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <StatusBadge status={app.status.status_name} />
                    </div>

                    <div className="col-span-2 flex items-center gap-1">
                      <button
                        onClick={() => setProfileModal(app)}
                        title="View Profile"
                        className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                      >
                        <User size={14} />
                      </button>
                      {app.seeker.resume_url && (
                        <>
                          <a
                            href={app.seeker.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View Resume"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <ExternalLink size={13} />
                          </a>
                          <button
                            onClick={() =>
                              downloadResume(
                                app.seeker.resume_url!,
                                `${app.seeker.full_name}_resume.pdf`,
                              )
                            }
                            title="Download Resume"
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                          >
                            <Download size={13} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => scheduleInterview(app)}
                        title="Schedule Interview"
                        className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                      >
                        <Calendar size={14} />
                      </button>
                    </div>

                    <div className="col-span-1 flex items-center justify-end gap-1">
                      <button
                        onClick={() =>
                          setExpanded(expandedId === app.id ? null : app.id)
                        }
                        title="View details"
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      >
                        <ChevronRight
                          size={13}
                          className={`transition-transform ${expandedId === app.id ? "rotate-90" : ""}`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Expanded section (same as before, but add status change shortcuts if needed) */}
                  {expandedId === app.id && (
                    <div className="px-5 pb-5 pt-2 border-t border-gray-50 bg-slate-50/50">
                      <div className="flex gap-6 pt-2">
                        <div className="flex-1 space-y-4">
                          <div className="flex gap-2">
                            {app.seeker.resume_url && (
                              <a
                                href={app.seeker.resume_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs font-medium text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                              >
                                <FileText size={12} /> View Resume{" "}
                                <ExternalLink size={11} />
                              </a>
                            )}
                            <a
                              href={`mailto:${app.seeker.email}`}
                              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-lg transition"
                            >
                              <Mail size={12} /> Send Email
                            </a>
                          </div>

                          {app.cover_letter && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                Cover Letter
                              </p>
                              <div className="bg-white border border-gray-100 rounded-xl p-4">
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                  {app.cover_letter}
                                </p>
                              </div>
                            </div>
                          )}

                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                              Quick Actions
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              {[
                                "Shortlisted",
                                "Interview",
                                "Accepted",
                                "Rejected",
                              ].map((s) => (
                                <button
                                  key={s}
                                  onClick={() => updateStatus(app.id, s)}
                                  disabled={
                                    app.status.status_name === s ||
                                    updating === app.id
                                  }
                                  className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition disabled:opacity-40 ${
                                    s === "Accepted"
                                      ? "border-green-200 text-green-700 bg-green-50 hover:bg-green-100"
                                      : s === "Rejected"
                                        ? "border-red-200 text-red-600 bg-red-50 hover:bg-red-100"
                                        : s === "Interview"
                                          ? "border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
                                          : "border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100"
                                  }`}
                                >
                                  {s === "Accepted" && (
                                    <CheckCircle
                                      size={11}
                                      className="inline mr-1"
                                    />
                                  )}
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="w-72 shrink-0">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Internal Notes ({app.notes.length})
                          </p>
                          <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                            {app.notes.length === 0 && (
                              <p className="text-xs text-gray-400">
                                No notes yet. Add your first note below.
                              </p>
                            )}
                            {app.notes.map((note) => (
                              <div
                                key={note.id}
                                className="text-xs bg-white border border-gray-100 rounded-xl p-2.5"
                              >
                                <p className="text-gray-700">
                                  {note.note_text}
                                </p>
                                <p className="text-gray-400 mt-1">
                                  {new Date(
                                    note.created_at,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              value={newNote[app.id] ?? ""}
                              onChange={(e) =>
                                setNewNote((p) => ({
                                  ...p,
                                  [app.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) =>
                                e.key === "Enter" && addNote(app.id)
                              }
                              placeholder="Add a private note..."
                              className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-200 bg-white"
                            />
                            <button
                              onClick={() => addNote(app.id)}
                              className="text-xs bg-purple-600 text-white px-3 py-2 rounded-xl hover:bg-purple-700 transition font-medium"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Profile Modal */}
      {profileModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setProfileModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                Applicant Profile
              </h3>
              <button
                onClick={() => setProfileModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-lg font-bold">
                  {initials(profileModal.seeker.full_name)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {profileModal.seeker.full_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {profileModal.seeker.email}
                  </p>
                </div>
              </div>
              <div className="border-t pt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User size={14} className="text-gray-400" />{" "}
                  <span className="font-medium">Full Name:</span>{" "}
                  {profileModal.seeker.full_name}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={14} className="text-gray-400" />{" "}
                  <span className="font-medium">Email:</span>{" "}
                  {profileModal.seeker.email}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={14} className="text-gray-400" />{" "}
                  <span className="font-medium">Phone:</span>{" "}
                  {profileModal.seeker.phone || "Not provided"}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={14} className="text-gray-400" />{" "}
                  <span className="font-medium">Location:</span>{" "}
                  {profileModal.seeker.location || "Not provided"}
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Code size={14} className="text-gray-400 mt-0.5" />{" "}
                  <span className="font-medium">Skills:</span>{" "}
                  {profileModal.seeker.skills?.join(", ") || "Not provided"}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={14} className="text-gray-400" />{" "}
                  <span className="font-medium">Applied:</span>{" "}
                  {new Date(profileModal.applied_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interview Modal */}
      {interviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setInterviewModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                Schedule Interview
              </h3>
              <button
                onClick={() => setInterviewModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Candidate:{" "}
                <span className="font-semibold">
                  {interviewModal.app.seeker.full_name}
                </span>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2"
                  onChange={(e) =>
                    setInterviewModal({
                      ...interviewModal,
                      date: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2"
                  onChange={(e) =>
                    setInterviewModal({
                      ...interviewModal,
                      time: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setInterviewModal(null)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmInterview}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg"
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
