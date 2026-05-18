import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAppSelector } from "../../store/hooks";
import type { Job, Application } from "./types";
import {
  Users,
  Search,
  Download,
  ChevronDown,
  ExternalLink,
  FileText,
  User,
  ChevronRight,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Interview: "bg-blue-50 text-blue-700 border-blue-200",
    Accepted: "bg-green-50 text-green-700 border-green-200",
    Rejected: "bg-red-50 text-red-600 border-red-200",
    Shortlisted: "bg-violet-50 text-violet-700 border-violet-200",
  };
  const cls = map[status] ?? "bg-gray-50 text-gray-600 border-gray-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {status}
    </span>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const avatarColors = [
  "bg-blue-100 text-blue-600",
  "bg-violet-100 text-violet-600",
  "bg-green-100 text-green-600",
  "bg-amber-100 text-amber-600",
  "bg-rose-100 text-rose-600",
];

export default function EmployerApplicantsPage() {
  const { token } = useAppSelector((state) => state.auth);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .get("/employer/jobs")
      .then((res) => {
        setJobs(res.data);
        if (res.data.length > 0) setSelectedJobId(res.data[0].id);
      })
      .finally(() => setLoadingJobs(false));
  }, [token]);

  useEffect(() => {
    if (!selectedJobId) return;
    setLoadingApps(true);
    api
      .get(`/employer/jobs/${selectedJobId}/applicants`)
      .then((res) => setApplications(res.data))
      .catch(console.error)
      .finally(() => setLoadingApps(false));
  }, [selectedJobId]);

  const updateStatus = async (appId: string, status: string) => {
    setUpdating(appId);
    try {
      await api.patch(`/employer/applications/${appId}/status`, {
        statusName: status,
      });
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId ? { ...a, status: { status_name: status } } : a
        )
      );
    } finally {
      setUpdating(null);
    }
  };

  const exportCSV = async () => {
    if (!selectedJobId) return;
    const res = await api.get(`/employer/jobs/${selectedJobId}/export`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = `applicants_${selectedJobId}.csv`;
    a.click();
  };

  const filtered = applications.filter((a) =>
    a.seeker.full_name.toLowerCase().includes(search.toLowerCase()) ||
    a.seeker.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Applicants</h2>
          <p className="text-sm text-gray-500">
            Review and manage candidates
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={!selectedJobId || applications.length === 0}
          className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium px-4 py-2 rounded-xl transition disabled:opacity-40"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Job selector */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <label className="block text-xs text-gray-500 mb-1 font-medium">
            Select Job
          </label>
          {loadingJobs ? (
            <div className="h-9 bg-gray-100 rounded-lg animate-pulse" />
          ) : (
            <div className="relative">
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full appearance-none text-sm border border-gray-200 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-white cursor-pointer"
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
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1 font-medium">
            Search Applicants
          </label>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
            />
          </div>
        </div>
      </div>

      {/* Stats row */}
      {!loadingApps && applications.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total", count: applications.length, color: "text-gray-700" },
            {
              label: "Pending",
              count: applications.filter((a) => a.status.status_name === "Pending").length,
              color: "text-yellow-600",
            },
            {
              label: "Shortlisted",
              count: applications.filter((a) =>
                ["Shortlisted", "Interview"].includes(a.status.status_name)
              ).length,
              color: "text-blue-600",
            },
            {
              label: "Accepted",
              count: applications.filter((a) => a.status.status_name === "Accepted").length,
              color: "text-green-600",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm"
            >
              <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Applicants list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {!selectedJobId ? (
          <div className="py-16 text-center">
            <Users size={36} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-500">Select a job to view applicants</p>
          </div>
        ) : loadingApps ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-100 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-36 bg-gray-100 rounded" />
                  <div className="h-3 w-48 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={36} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-500">No applicants found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((app, idx) => (
              <div key={app.id} className="group">
                {/* Main row */}
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                      avatarColors[idx % avatarColors.length]
                    }`}
                  >
                    {initials(app.seeker.full_name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {app.seeker.full_name}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-400">
                        {app.seeker.email}
                      </span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">
                        Applied{" "}
                        {new Date(app.applied_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Resume link */}
                  {app.seeker.resume_url && (
                    <a
                      href={app.seeker.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden md:flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition"
                    >
                      <FileText size={13} /> Resume
                      <ExternalLink size={11} />
                    </a>
                  )}

                  {/* Status badge */}
                  <StatusBadge status={app.status.status_name} />

                  {/* Status dropdown */}
                  <div className="relative">
                    <select
                      value={app.status.status_name}
                      onChange={(e) => updateStatus(app.id, e.target.value)}
                      disabled={updating === app.id}
                      className="appearance-none text-xs border border-gray-200 rounded-lg px-2 py-1.5 pr-6 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer disabled:opacity-50"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview">Interview</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    <ChevronDown
                      size={10}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>

                  {/* Expand toggle */}
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === app.id ? null : app.id)
                    }
                    className="p-1.5 text-gray-300 hover:text-gray-600 transition-colors"
                  >
                    <ChevronRight
                      size={14}
                      className={`transition-transform ${
                        expandedId === app.id ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Expanded detail */}
                {expandedId === app.id && (
                  <div className="px-5 pb-4 pt-0 border-t border-gray-50 bg-gray-50/50">
                    <div className="flex gap-6 pt-3">
                      {/* Cover letter */}
                      {app.cover_letter && (
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                            Cover Letter
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {app.cover_letter}
                          </p>
                        </div>
                      )}

                      {/* Notes */}
                      <div className="w-64 flex-shrink-0">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                          Notes ({app.notes.length})
                        </p>
                        <div className="space-y-2 mb-2">
                          {app.notes.map((note) => (
                            <div
                              key={note.id}
                              className="text-xs bg-white border border-gray-100 rounded-lg p-2"
                            >
                              <p className="text-gray-700">{note.note_text}</p>
                              <p className="text-gray-400 mt-1">
                                {new Date(note.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const input = form.elements.namedItem(
                              "note"
                            ) as HTMLInputElement;
                            if (!input.value.trim()) return;
                            await api.post(
                              `/employer/applications/${app.id}/notes`,
                              { noteText: input.value }
                            );
                            input.value = "";
                            const res = await api.get(
                              `/employer/jobs/${selectedJobId}/applicants`
                            );
                            setApplications(res.data);
                          }}
                          className="flex gap-2"
                        >
                          <input
                            name="note"
                            placeholder="Add a note..."
                            className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-200"
                          />
                          <button
                            type="submit"
                            className="text-xs bg-blue-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-blue-700 transition"
                          >
                            Add
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
