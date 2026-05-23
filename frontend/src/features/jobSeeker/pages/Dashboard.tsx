/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Bookmark,
  FileText,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Briefcase,
  Calendar,
  TrendingUp,
  Edit3,
  Plus,
  X,
  Upload,
  ExternalLink,
  CheckCircle,
  Clock,
  Award,
  Code,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Download,
  Eye,
  AlertCircle,
  Loader2,
  // Removed Linkedin, Github – they don't exist in lucide-react
} from "lucide-react";
import { FaLinkedin, FaGithub } from "react-icons/fa"; // ← correct icons
import api from "../../../services/api";
import { RootState, AppDispatch } from "../../../store";
import {
  fetchJobs,
  fetchBookmarks,
  fetchApplications,
} from "../jobSeekerSlice";

// ─── Types ───────────────────────────────────────────────────
interface Skill {
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}
interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
  credentialId?: string;
}
interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  url?: string;
  githubUrl?: string;
  image?: string;
}
interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
  current: boolean;
}
interface Experience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface ProfileData {
  fullName: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  avatarUrl: string;
  skills: Skill[];
  certificates: Certificate[];
  projects: Project[];
  education: Education[];
  experience: Experience[];
  languages: { name: string; level: string }[];
  availability: string;
  expectedSalary: string;
}

// ─── Nav items ───────────────────────────────────────────────
const NAV = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={16} /> },
  { id: "profile", label: "My Profile", icon: <User size={16} /> },
  { id: "jobs", label: "Find Jobs", icon: <Search size={16} /> },
  { id: "applications", label: "Applications", icon: <FileText size={16} /> },
  { id: "saved", label: "Saved Jobs", icon: <Bookmark size={16} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
  { id: "settings", label: "Settings", icon: <Settings size={16} /> },
];

const statusColor: Record<string, string> = {
  Interview: "bg-blue-50 text-blue-700 border-blue-200",
  Accepted: "bg-green-50 text-green-700 border-green-200",
  Rejected: "bg-red-50 text-red-600 border-red-200",
  Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

const SKILL_LEVELS: Skill["level"][] = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
];
const levelColor: Record<string, string> = {
  Beginner: "bg-gray-100 text-gray-600",
  Intermediate: "bg-blue-50 text-blue-700",
  Advanced: "bg-violet-50 text-violet-700",
  Expert: "bg-green-50 text-green-700",
};

// ─── Helpers ─────────────────────────────────────────────────
const inp =
  "w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition placeholder:text-gray-300";
const genId = () => Math.random().toString(36).slice(2, 9);

// ─── Main component ──────────────────────────────────────────
export default function JobSeekerDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const {
    jobs,
    loading: jobsLoading,
    bookmarks,
    applications,
  } = useSelector(
    (s: RootState) =>
      s.jobSeeker || {
        jobs: [],
        loading: false,
        bookmarks: [],
        applications: [],
      },
  );

  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const initials = (user?.email ?? "U").slice(0, 2).toUpperCase();

  // ── Active page (sidebar does NOT re-render on page change) ──
  const [page, setPage] = useState<string>("overview");

  // ── Profile state ────────────────────────────────────────────
  const [profile, setProfile] = useState<ProfileData>({
    fullName: user?.fullName ?? user?.email?.split("@")[0] ?? "",
    title: "",
    bio: "",
    email: user?.email ?? "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    avatarUrl: "",
    skills: [],
    certificates: [],
    projects: [],
    education: [],
    experience: [],
    languages: [],
    availability: "Open to work",
    expectedSalary: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");
  const avatarRef = useRef<HTMLInputElement>(null);

  // ── Modal / editor state ────────────────────────────────────
  const [editSection, setEditSection] = useState<string | null>(null);

  // skill editor
  const [newSkill, setNewSkill] = useState<Skill>({
    name: "",
    level: "Intermediate",
  });
  // cert editor
  const [newCert, setNewCert] = useState<Certificate>({
    id: "",
    name: "",
    issuer: "",
    date: "",
    url: "",
    credentialId: "",
  });
  // project editor
  const [newProj, setNewProj] = useState<Project>({
    id: "",
    title: "",
    description: "",
    technologies: [],
    url: "",
    githubUrl: "",
  });
  const [projTechInput, setProjTechInput] = useState("");
  // edu editor
  const [newEdu, setNewEdu] = useState<Education>({
    id: "",
    school: "",
    degree: "",
    field: "",
    startYear: "",
    endYear: "",
    current: false,
  });
  // exp editor
  const [newExp, setNewExp] = useState<Experience>({
    id: "",
    company: "",
    title: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });
  // language editor
  const [newLang, setNewLang] = useState({ name: "", level: "Conversational" });

  // job search filters
  const [jobFilters, setJobFilters] = useState({
    keyword: "",
    location: "",
    industry: "",
  });

  // Resume upload
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");
  const resumeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(fetchJobs({}));
    dispatch(fetchBookmarks());
    dispatch(fetchApplications());
    // try loading profile
    api
      .get("/jobseeker/profile")
      .then((r) => setProfile((p) => ({ ...p, ...r.data })))
      .catch(() => {});
  }, [dispatch]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const saveProfile = async () => {
    setProfileLoading(true);
    setProfileError("");
    try {
      await api.put("/jobseeker/profile", profile);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch {
      setProfileError("Failed to save profile. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  const uploadAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfile((p) => ({ ...p, avatarUrl: URL.createObjectURL(file) }));
  };

  const uploadResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeUploading(true);
    try {
      const fd = new FormData();
      fd.append("resume", file);
      const { data } = await api.post("/jobseeker/resume", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResumeUrl(data.url ?? URL.createObjectURL(file));
    } catch {
      setResumeUrl(URL.createObjectURL(file));
    } finally {
      setResumeUploading(false);
    }
  };

  // completion
  const completionItems = [
    !!profile.fullName,
    !!profile.title,
    !!profile.bio,
    !!profile.avatarUrl,
    profile.skills.length > 0,
    profile.experience.length > 0,
    profile.education.length > 0,
    !!resumeUrl,
  ];
  const completionPct = Math.round(
    (completionItems.filter(Boolean).length / completionItems.length) * 100,
  );

  // ── Sidebar (memo-style – never re-mounts) ───────────────────
  const Sidebar = (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen overflow-y-auto flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 flex-shrink-0">
        <span className="text-lg font-bold text-blue-600 tracking-tight">
          JobPortal
        </span>
      </div>

      {/* Profile mini card */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className="relative cursor-pointer"
            onClick={() => setPage("profile")}
          >
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-100"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                {initials}
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {profile.fullName || user?.email?.split("@")[0] || "Profile"}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {profile.title || "Job Seeker"}
            </p>
          </div>
        </div>
        {/* Profile completion */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Profile strength</span>
            <span className="text-xs font-medium text-blue-600">
              {completionPct}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto">
        <ul className="space-y-0.5">
          {NAV.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setPage(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                  page === item.id
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span
                  className={
                    page === item.id ? "text-blue-500" : "text-gray-400"
                  }
                >
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.id === "applications" && applications.length > 0 && (
                  <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                    {applications.length}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 px-3 py-3 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition font-medium"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );

  // ─── PAGE: Overview ──────────────────────────────────────────
  const PageOverview = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Welcome back,{" "}
            {profile.fullName || user?.email?.split("@")[0] || "there"} 👋
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Here's your job search activity
          </p>
        </div>
        <button
          onClick={() => setPage("jobs")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition shadow-sm"
        >
          <Search size={14} /> Find Jobs
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Applications",
            value: applications.length,
            icon: <FileText size={17} />,
            bg: "bg-blue-50",
            color: "text-blue-600",
            path: "applications",
          },
          {
            label: "Interviews",
            value: applications.filter((a) => a.status === "Interview").length,
            icon: <Calendar size={17} />,
            bg: "bg-green-50",
            color: "text-green-600",
            path: "applications",
          },
          {
            label: "Job Matches",
            value: jobs.length,
            icon: <TrendingUp size={17} />,
            bg: "bg-violet-50",
            color: "text-violet-600",
            path: "jobs",
          },
          {
            label: "Saved Jobs",
            value: bookmarks.length,
            icon: <Bookmark size={17} />,
            bg: "bg-amber-50",
            color: "text-amber-600",
            path: "saved",
          },
        ].map((c) => (
          <button
            key={c.label}
            onClick={() => setPage(c.path)}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div
              className={`${c.bg} ${c.color} w-9 h-9 rounded-xl flex items-center justify-center mb-3`}
            >
              {c.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{c.label}</p>
          </button>
        ))}
      </div>

      {/* Profile completion prompt */}
      {completionPct < 100 && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Complete your profile — {completionPct}% done
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                A complete profile gets 5× more views from employers
              </p>
            </div>
          </div>
          <button
            onClick={() => setPage("profile")}
            className="text-xs font-semibold text-blue-700 bg-white border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition flex-shrink-0"
          >
            Complete Profile
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recommended jobs */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">
              Recommended for You
            </h3>
            <button
              onClick={() => setPage("jobs")}
              className="text-xs text-blue-600 font-medium flex items-center gap-1"
            >
              See all <ChevronRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {jobsLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-5 py-4 animate-pulse"
                  >
                    <div className="w-9 h-9 bg-gray-100 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-40 bg-gray-100 rounded" />
                      <div className="h-3 w-28 bg-gray-100 rounded" />
                    </div>
                  </div>
                ))
              : jobs.slice(0, 4).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition"
                  >
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Briefcase size={14} className="text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {job.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {job.company} · {job.location}
                      </p>
                    </div>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-xs text-blue-600 font-medium flex-shrink-0"
                    >
                      Apply →
                    </Link>
                  </div>
                ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Quick Links
            </h3>
            {[
              {
                label: "Update my profile",
                page: "profile",
                icon: <User size={13} className="text-blue-500" />,
              },
              {
                label: "Browse all jobs",
                page: "jobs",
                icon: <Search size={13} className="text-violet-500" />,
              },
              {
                label: "My applications",
                page: "applications",
                icon: <FileText size={13} className="text-green-500" />,
              },
              {
                label: "Saved jobs",
                page: "saved",
                icon: <Bookmark size={13} className="text-amber-500" />,
              },
            ].map((l) => (
              <button
                key={l.label}
                onClick={() => setPage(l.page)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-50 text-sm text-gray-700 transition text-left"
              >
                {l.icon} {l.label}
                <ChevronRight size={12} className="ml-auto text-gray-300" />
              </button>
            ))}
          </div>

          {/* Recent applications */}
          {applications.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Recent Applications
                </h3>
                <button
                  onClick={() => setPage("applications")}
                  className="text-xs text-blue-600 font-medium"
                >
                  View all
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {applications.slice(0, 3).map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <p className="text-xs font-medium text-gray-700 truncate flex-1">
                      {app.jobTitle}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-medium ml-2 flex-shrink-0 ${statusColor[app.status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}
                    >
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ─── PAGE: Profile ──────────────────────────────────────────
  const PageProfile = (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">My Profile</h2>
          <p className="text-sm text-gray-500">
            Your public profile seen by employers · {completionPct}% complete
          </p>
        </div>
        <div className="flex items-center gap-2">
          {profileSaved && (
            <span className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
              <CheckCircle size={12} /> Saved
            </span>
          )}
          <button
            onClick={saveProfile}
            disabled={profileLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-xl transition"
          >
            {profileLoading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <CheckCircle size={13} />
            )}
            Save Profile
          </button>
        </div>
      </div>

      {profileError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={14} /> {profileError}
        </div>
      )}

      {/* Hero card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-blue-500 to-indigo-600" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-8 mb-4">
            <div className="relative">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Avatar"
                  className="w-16 h-16 rounded-2xl object-cover border-3 border-white shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
                  {initials}
                </div>
              )}
              <button
                onClick={() => avatarRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow hover:bg-blue-700 transition"
              >
                <Edit3 size={11} className="text-white" />
              </button>
              <input
                ref={avatarRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={uploadAvatar}
              />
            </div>
            <div className="flex-1 pb-1">
              <input
                value={profile.fullName}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, fullName: e.target.value }))
                }
                placeholder="Your Full Name"
                className="text-lg font-bold text-gray-900 bg-transparent border-none outline-none w-full"
              />
              <input
                value={profile.title}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Professional title — e.g. Senior React Developer"
                className="text-sm text-gray-500 bg-transparent border-none outline-none w-full mt-0.5"
              />
            </div>
            <div className="flex gap-2 pb-1">
              <select
                value={profile.availability}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, availability: e.target.value }))
                }
                className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option>Open to work</option>
                <option>Not available</option>
                <option>Actively searching</option>
                <option>Casually looking</option>
              </select>
            </div>
          </div>

          {/* Bio */}
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
            rows={3}
            placeholder="Write a compelling summary about yourself, your experience, and what you're looking for..."
            className="w-full text-sm text-gray-700 bg-transparent border-none outline-none resize-none placeholder:text-gray-300 leading-relaxed"
          />

          {/* Contact fields */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
            {[
              {
                icon: <Mail size={13} />,
                key: "email",
                placeholder: "Email",
                type: "email",
              },
              {
                icon: <Phone size={13} />,
                key: "phone",
                placeholder: "Phone",
                type: "text",
              },
              {
                icon: <MapPin size={13} />,
                key: "location",
                placeholder: "Location",
                type: "text",
              },
              {
                icon: <Globe size={13} />,
                key: "website",
                placeholder: "Website",
                type: "url",
              },
              {
                icon: <FaLinkedin size={13} />, // ✅ fixed
                key: "linkedin",
                placeholder: "LinkedIn URL",
                type: "url",
              },
              {
                icon: <FaGithub size={13} />, // ✅ fixed
                key: "github",
                placeholder: "GitHub URL",
                type: "url",
              },
            ].map((f) => (
              <div
                key={f.key}
                className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2"
              >
                <span className="text-gray-400 flex-shrink-0">{f.icon}</span>
                <input
                  type={f.type}
                  value={(profile as any)[f.key]}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, [f.key]: e.target.value }))
                  }
                  placeholder={f.placeholder}
                  className="flex-1 text-xs bg-transparent border-none outline-none text-gray-700 placeholder:text-gray-400 min-w-0"
                />
              </div>
            ))}
          </div>

          {/* Salary expectation */}
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs text-gray-500">Expected Salary:</span>
            <input
              value={profile.expectedSalary}
              onChange={(e) =>
                setProfile((p) => ({ ...p, expectedSalary: e.target.value }))
              }
              placeholder="e.g. $80,000 / year"
              className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Resume upload */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Resume / CV</h3>
          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition"
            >
              <Eye size={12} /> Preview
            </a>
          )}
        </div>
        {resumeUrl ? (
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
            <FileText size={18} className="text-green-600 flex-shrink-0" />
            <span className="text-sm text-green-700 font-medium">
              Resume uploaded
            </span>
            <button
              onClick={() => resumeRef.current?.click()}
              className="ml-auto text-xs text-green-700 hover:underline"
            >
              Replace
            </button>
          </div>
        ) : (
          <button
            onClick={() => resumeRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:bg-blue-50 transition group text-center"
          >
            {resumeUploading ? (
              <Loader2
                size={22}
                className="mx-auto mb-2 text-blue-500 animate-spin"
              />
            ) : (
              <Upload
                size={22}
                className="mx-auto mb-2 text-gray-300 group-hover:text-blue-500 transition"
              />
            )}
            <p className="text-sm font-medium text-gray-500 group-hover:text-blue-600 transition">
              {resumeUploading ? "Uploading..." : "Click to upload your resume"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PDF, DOC, DOCX up to 5MB
            </p>
          </button>
        )}
        <input
          ref={resumeRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={uploadResume}
        />
      </div>

      {/* Skills */}
      <ProfileSection
        title="Skills"
        icon={<Code size={15} />}
        onAdd={() => {
          setNewSkill({ name: "", level: "Intermediate" });
          setEditSection("skill");
        }}
      >
        {profile.skills.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">
            No skills added yet. Add your technical and soft skills.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5"
              >
                <span className="text-xs font-medium text-gray-800">
                  {s.name}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${levelColor[s.level]}`}
                >
                  {s.level}
                </span>
                <button
                  onClick={() =>
                    setProfile((p) => ({
                      ...p,
                      skills: p.skills.filter((_, j) => j !== i),
                    }))
                  }
                  className="text-gray-300 hover:text-red-400 transition ml-0.5"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
        {editSection === "skill" && (
          <ModalOverlay onClose={() => setEditSection(null)} title="Add Skill">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Skill Name *
                </label>
                <input
                  value={newSkill.name}
                  onChange={(e) =>
                    setNewSkill((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. React, Python, Project Management"
                  className={inp}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Proficiency Level
                </label>
                <div className="flex gap-2 flex-wrap">
                  {SKILL_LEVELS.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setNewSkill((p) => ({ ...p, level: l }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${newSkill.level === l ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-blue-300"}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  if (!newSkill.name.trim()) return;
                  setProfile((p) => ({
                    ...p,
                    skills: [...p.skills, newSkill],
                  }));
                  setEditSection(null);
                }}
                className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
              >
                Add Skill
              </button>
            </div>
          </ModalOverlay>
        )}
      </ProfileSection>

      {/* Certificates */}
      <ProfileSection
        title="Licenses & Certifications"
        icon={<Award size={15} />}
        onAdd={() => {
          setNewCert({
            id: genId(),
            name: "",
            issuer: "",
            date: "",
            url: "",
            credentialId: "",
          });
          setEditSection("cert");
        }}
      >
        {profile.certificates.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">
            Add your professional certifications and licenses.
          </p>
        ) : (
          profile.certificates.map((c) => (
            <div
              key={c.id}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl mb-2"
            >
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Award size={16} className="text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                <p className="text-xs text-gray-500">{c.issuer}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-xs text-gray-400">{c.date}</p>
                  {c.credentialId && (
                    <p className="text-xs text-gray-400">
                      ID: {c.credentialId}
                    </p>
                  )}
                </div>
                {c.url && (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                  >
                    <ExternalLink size={10} /> View Certificate
                  </a>
                )}
              </div>
              <button
                onClick={() =>
                  setProfile((p) => ({
                    ...p,
                    certificates: p.certificates.filter((x) => x.id !== c.id),
                  }))
                }
                className="text-gray-300 hover:text-red-400 transition flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))
        )}
        {editSection === "cert" && (
          <ModalOverlay
            onClose={() => setEditSection(null)}
            title="Add Certification"
          >
            <div className="space-y-3">
              {[
                {
                  key: "name",
                  label: "Certification Name *",
                  placeholder: "e.g. AWS Certified Solutions Architect",
                },
                {
                  key: "issuer",
                  label: "Issuing Organization *",
                  placeholder: "e.g. Amazon Web Services",
                },
                {
                  key: "date",
                  label: "Issue Date",
                  placeholder: "e.g. March 2023",
                },
                {
                  key: "credentialId",
                  label: "Credential ID",
                  placeholder: "Optional",
                },
                {
                  key: "url",
                  label: "Credential URL",
                  placeholder: "https://...",
                },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {f.label}
                  </label>
                  <input
                    value={(newCert as any)[f.key]}
                    onChange={(e) =>
                      setNewCert((p) => ({ ...p, [f.key]: e.target.value }))
                    }
                    placeholder={f.placeholder}
                    className={inp}
                  />
                </div>
              ))}
              <button
                onClick={() => {
                  if (!newCert.name || !newCert.issuer) return;
                  setProfile((p) => ({
                    ...p,
                    certificates: [...p.certificates, newCert],
                  }));
                  setEditSection(null);
                }}
                className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
              >
                Add Certification
              </button>
            </div>
          </ModalOverlay>
        )}
      </ProfileSection>

      {/* Projects */}
      <ProfileSection
        title="Projects & Portfolio"
        icon={<Code size={15} />}
        onAdd={() => {
          setNewProj({
            id: genId(),
            title: "",
            description: "",
            technologies: [],
            url: "",
            githubUrl: "",
          });
          setProjTechInput("");
          setEditSection("project");
        }}
      >
        {profile.projects.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">
            Showcase your projects to stand out to employers.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.projects.map((p) => (
              <div
                key={p.id}
                className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-24 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                  <Code size={28} className="text-blue-300" />
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    {p.title}
                  </p>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                    {p.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {p.technologies.slice(0, 4).map((t) => (
                      <span
                        key={t}
                        className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    {p.url && (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 flex items-center gap-1"
                      >
                        <ExternalLink size={11} /> Live
                      </a>
                    )}
                    {p.githubUrl && (
                      <a
                        href={p.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-500 flex items-center gap-1"
                      >
                        <FaGithub size={11} /> Code
                      </a>
                    )}
                    <button
                      onClick={() =>
                        setProfile((prev) => ({
                          ...prev,
                          projects: prev.projects.filter((x) => x.id !== p.id),
                        }))
                      }
                      className="ml-auto text-gray-300 hover:text-red-400 transition"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {editSection === "project" && (
          <ModalOverlay
            onClose={() => setEditSection(null)}
            title="Add Project"
          >
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Project Title *
                </label>
                <input
                  value={newProj.title}
                  onChange={(e) =>
                    setNewProj((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="e.g. E-commerce Platform"
                  className={inp}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Description *
                </label>
                <textarea
                  value={newProj.description}
                  onChange={(e) =>
                    setNewProj((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={3}
                  placeholder="Describe what you built, your role, and the impact..."
                  className={inp + " resize-none"}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Technologies Used
                </label>
                <div className="flex gap-2">
                  <input
                    value={projTechInput}
                    onChange={(e) => setProjTechInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (projTechInput.trim()) {
                          setNewProj((p) => ({
                            ...p,
                            technologies: [
                              ...p.technologies,
                              projTechInput.trim(),
                            ],
                          }));
                          setProjTechInput("");
                        }
                      }
                    }}
                    placeholder="React, Node.js — press Enter"
                    className={inp + " flex-1"}
                  />
                </div>
                {newProj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {newProj.technologies.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full"
                      >
                        {t}{" "}
                        <button
                          type="button"
                          onClick={() =>
                            setNewProj((p) => ({
                              ...p,
                              technologies: p.technologies.filter(
                                (x) => x !== t,
                              ),
                            }))
                          }
                          className="hover:text-red-500"
                        >
                          <X size={9} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Live URL
                  </label>
                  <input
                    value={newProj.url}
                    onChange={(e) =>
                      setNewProj((p) => ({ ...p, url: e.target.value }))
                    }
                    placeholder="https://..."
                    className={inp}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    GitHub URL
                  </label>
                  <input
                    value={newProj.githubUrl}
                    onChange={(e) =>
                      setNewProj((p) => ({ ...p, githubUrl: e.target.value }))
                    }
                    placeholder="https://github.com/..."
                    className={inp}
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  if (!newProj.title || !newProj.description) return;
                  setProfile((p) => ({
                    ...p,
                    projects: [...p.projects, newProj],
                  }));
                  setEditSection(null);
                }}
                className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
              >
                Add Project
              </button>
            </div>
          </ModalOverlay>
        )}
      </ProfileSection>

      {/* Experience */}
      <ProfileSection
        title="Work Experience"
        icon={<Briefcase size={15} />}
        onAdd={() => {
          setNewExp({
            id: genId(),
            company: "",
            title: "",
            location: "",
            startDate: "",
            endDate: "",
            current: false,
            description: "",
          });
          setEditSection("exp");
        }}
      >
        {profile.experience.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">
            Add your work history to help employers understand your background.
          </p>
        ) : (
          profile.experience.map((e) => (
            <div key={e.id} className="flex gap-3 mb-4 last:mb-0">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <Briefcase size={14} className="text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{e.title}</p>
                <p className="text-xs text-gray-600 font-medium">{e.company}</p>
                <p className="text-xs text-gray-400">
                  {e.startDate} — {e.current ? "Present" : e.endDate} ·{" "}
                  {e.location}
                </p>
                {e.description && (
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">
                    {e.description}
                  </p>
                )}
              </div>
              <button
                onClick={() =>
                  setProfile((p) => ({
                    ...p,
                    experience: p.experience.filter((x) => x.id !== e.id),
                  }))
                }
                className="text-gray-300 hover:text-red-400 transition flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))
        )}
        {editSection === "exp" && (
          <ModalOverlay
            onClose={() => setEditSection(null)}
            title="Add Experience"
          >
            <div className="space-y-3">
              {[
                {
                  key: "title",
                  label: "Job Title *",
                  placeholder: "e.g. Senior Software Engineer",
                },
                {
                  key: "company",
                  label: "Company *",
                  placeholder: "e.g. Google",
                },
                {
                  key: "location",
                  label: "Location",
                  placeholder: "e.g. Remote, New York",
                },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {f.label}
                  </label>
                  <input
                    value={(newExp as any)[f.key]}
                    onChange={(e) =>
                      setNewExp((p) => ({ ...p, [f.key]: e.target.value }))
                    }
                    placeholder={f.placeholder}
                    className={inp}
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Start Date
                  </label>
                  <input
                    value={newExp.startDate}
                    onChange={(e) =>
                      setNewExp((p) => ({ ...p, startDate: e.target.value }))
                    }
                    placeholder="e.g. Jan 2021"
                    className={inp}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    End Date
                  </label>
                  <input
                    value={newExp.endDate}
                    onChange={(e) =>
                      setNewExp((p) => ({ ...p, endDate: e.target.value }))
                    }
                    disabled={newExp.current}
                    placeholder="e.g. Dec 2023"
                    className={inp + " disabled:opacity-40"}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newExp.current}
                  onChange={(e) =>
                    setNewExp((p) => ({ ...p, current: e.target.checked }))
                  }
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-xs text-gray-600">
                  I currently work here
                </span>
              </label>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  value={newExp.description}
                  onChange={(e) =>
                    setNewExp((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={3}
                  placeholder="Describe your responsibilities and achievements..."
                  className={inp + " resize-none"}
                />
              </div>
              <button
                onClick={() => {
                  if (!newExp.title || !newExp.company) return;
                  setProfile((p) => ({
                    ...p,
                    experience: [...p.experience, newExp],
                  }));
                  setEditSection(null);
                }}
                className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
              >
                Add Experience
              </button>
            </div>
          </ModalOverlay>
        )}
      </ProfileSection>

      {/* Education */}
      <ProfileSection
        title="Education"
        icon={<Award size={15} />}
        onAdd={() => {
          setNewEdu({
            id: genId(),
            school: "",
            degree: "",
            field: "",
            startYear: "",
            endYear: "",
            current: false,
          });
          setEditSection("edu");
        }}
      >
        {profile.education.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">
            Add your educational background.
          </p>
        ) : (
          profile.education.map((e) => (
            <div key={e.id} className="flex gap-3 mb-3 last:mb-0">
              <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Award size={14} className="text-violet-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {e.degree} in {e.field}
                </p>
                <p className="text-xs text-gray-600">{e.school}</p>
                <p className="text-xs text-gray-400">
                  {e.startYear} — {e.current ? "Present" : e.endYear}
                </p>
              </div>
              <button
                onClick={() =>
                  setProfile((p) => ({
                    ...p,
                    education: p.education.filter((x) => x.id !== e.id),
                  }))
                }
                className="text-gray-300 hover:text-red-400 transition"
              >
                <X size={14} />
              </button>
            </div>
          ))
        )}
        {editSection === "edu" && (
          <ModalOverlay
            onClose={() => setEditSection(null)}
            title="Add Education"
          >
            <div className="space-y-3">
              {[
                {
                  key: "school",
                  label: "School / University *",
                  placeholder: "e.g. Addis Ababa University",
                },
                {
                  key: "degree",
                  label: "Degree *",
                  placeholder: "e.g. Bachelor's, Master's, PhD",
                },
                {
                  key: "field",
                  label: "Field of Study *",
                  placeholder: "e.g. Computer Science",
                },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {f.label}
                  </label>
                  <input
                    value={(newEdu as any)[f.key]}
                    onChange={(e) =>
                      setNewEdu((p) => ({ ...p, [f.key]: e.target.value }))
                    }
                    placeholder={f.placeholder}
                    className={inp}
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Start Year
                  </label>
                  <input
                    value={newEdu.startYear}
                    onChange={(e) =>
                      setNewEdu((p) => ({ ...p, startYear: e.target.value }))
                    }
                    placeholder="2019"
                    className={inp}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    End Year
                  </label>
                  <input
                    value={newEdu.endYear}
                    onChange={(e) =>
                      setNewEdu((p) => ({ ...p, endYear: e.target.value }))
                    }
                    disabled={newEdu.current}
                    placeholder="2023"
                    className={inp + " disabled:opacity-40"}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newEdu.current}
                  onChange={(e) =>
                    setNewEdu((p) => ({ ...p, current: e.target.checked }))
                  }
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-xs text-gray-600">
                  I'm currently studying here
                </span>
              </label>
              <button
                onClick={() => {
                  if (!newEdu.school || !newEdu.degree) return;
                  setProfile((p) => ({
                    ...p,
                    education: [...p.education, newEdu],
                  }));
                  setEditSection(null);
                }}
                className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
              >
                Add Education
              </button>
            </div>
          </ModalOverlay>
        )}
      </ProfileSection>

      {/* Languages */}
      <ProfileSection
        title="Languages"
        icon={<Globe size={15} />}
        onAdd={() => {
          setNewLang({ name: "", level: "Conversational" });
          setEditSection("lang");
        }}
      >
        {profile.languages.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">Add languages you speak.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.languages.map((l, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5"
              >
                <Globe size={12} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-800">
                  {l.name}
                </span>
                <span className="text-xs text-gray-400">· {l.level}</span>
                <button
                  onClick={() =>
                    setProfile((p) => ({
                      ...p,
                      languages: p.languages.filter((_, j) => j !== i),
                    }))
                  }
                  className="text-gray-300 hover:text-red-400 transition"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
        {editSection === "lang" && (
          <ModalOverlay
            onClose={() => setEditSection(null)}
            title="Add Language"
          >
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Language
                </label>
                <input
                  value={newLang.name}
                  onChange={(e) =>
                    setNewLang((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. English, Amharic, French"
                  className={inp}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Proficiency
                </label>
                <select
                  value={newLang.level}
                  onChange={(e) =>
                    setNewLang((p) => ({ ...p, level: e.target.value }))
                  }
                  className={inp + " appearance-none"}
                >
                  {[
                    "Native",
                    "Fluent",
                    "Advanced",
                    "Conversational",
                    "Basic",
                  ].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => {
                  if (!newLang.name.trim()) return;
                  setProfile((p) => ({
                    ...p,
                    languages: [...p.languages, newLang],
                  }));
                  setEditSection(null);
                }}
                className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
              >
                Add Language
              </button>
            </div>
          </ModalOverlay>
        )}
      </ProfileSection>
    </div>
  );

  // ─── PAGE: Find Jobs ─────────────────────────────────────────
  const PageJobs = (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-gray-900">Find Jobs</h2>
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={jobFilters.keyword}
            onChange={(e) =>
              setJobFilters((f) => ({ ...f, keyword: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") dispatch(fetchJobs(jobFilters));
            }}
            placeholder="Job title, keywords..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>
        <div className="relative sm:w-40">
          <MapPin
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={jobFilters.location}
            onChange={(e) =>
              setJobFilters((f) => ({ ...f, location: e.target.value }))
            }
            placeholder="Location"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>
        <button
          onClick={() => dispatch(fetchJobs(jobFilters))}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-xl transition"
        >
          Search
        </button>
      </div>
      {jobsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 animate-pulse"
            >
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">No jobs found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-5"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Briefcase size={16} className="text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition block truncate"
                  >
                    {job.title}
                  </Link>
                  <p className="text-xs text-gray-400">{job.company}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg flex items-center gap-1">
                  <MapPin size={10} />
                  {job.location}
                </span>
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                  {job.employmentType}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <span className="text-sm font-semibold text-gray-800">
                  {job.salaryRange || "Competitive"}
                </span>
                <Link
                  to={`/apply/${job.id}`}
                  className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-xl hover:bg-blue-700 transition font-medium"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── PAGE: Applications ──────────────────────────────────────
  const PageApplications = (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-gray-900">My Applications</h2>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {applications.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">No applications yet</p>
            <button
              onClick={() => setPage("jobs")}
              className="mt-3 text-sm text-blue-600 underline"
            >
              Browse jobs
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-5 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <span className="col-span-2">Job</span>
              <span>Applied</span>
              <span>Status</span>
              <span></span>
            </div>
            <div className="divide-y divide-gray-50">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="grid grid-cols-5 gap-2 items-center px-5 py-4 hover:bg-gray-50 transition"
                >
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Briefcase size={13} className="text-blue-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {app.jobTitle}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                  <span
                    className={`inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor[app.status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}
                  >
                    {app.status}
                  </span>
                  <Link
                    to={`/jobs/${app.jobId}`}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 justify-end"
                  >
                    <Eye size={12} /> View
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  // ─── PAGE: Saved Jobs ────────────────────────────────────────
  const PageSaved = (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-gray-900">Saved Jobs</h2>
      {bookmarks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
          <Bookmark size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">No saved jobs yet</p>
          <button
            onClick={() => setPage("jobs")}
            className="mt-3 text-sm text-blue-600 underline"
          >
            Browse jobs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bookmarks.map((bm) => {
            const job = jobs.find((j) => j.id === bm.jobId);
            return (
              <div
                key={bm.jobId}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bookmark
                      size={14}
                      className="text-amber-500"
                      fill="currentColor"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {job?.title ?? bm.jobId}
                    </p>
                    {job && (
                      <p className="text-xs text-gray-400">
                        {job.company} · {job.location}
                      </p>
                    )}
                  </div>
                </div>
                {job && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <span className="text-sm font-semibold text-gray-800">
                      {job.salaryRange}
                    </span>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-xl hover:bg-blue-700 transition font-medium"
                    >
                      Apply Now
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ─── PAGE: Notifications ─────────────────────────────────────
  const PageNotifications = (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="py-16 text-center">
          <Bell size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">No notifications yet</p>
          <p className="text-gray-400 text-sm mt-1">
            You'll see application updates and job alerts here
          </p>
        </div>
      </div>
    </div>
  );

  // ─── PAGE: Settings ──────────────────────────────────────────
  const PageSettings = (
    <div className="space-y-5 max-w-lg">
      <h2 className="text-lg font-bold text-gray-900">Settings</h2>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3">
          Account
        </h3>
        {[
          { label: "Email Address", value: user?.email ?? "", type: "email" },
          { label: "Full Name", value: profile.fullName, type: "text" },
        ].map((f) => (
          <div key={f.label}>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              {f.label}
            </label>
            <input defaultValue={f.value} type={f.type} className={inp} />
          </div>
        ))}
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition">
          <CheckCircle size={14} /> Save Changes
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3">
          Change Password
        </h3>
        {["Current Password", "New Password", "Confirm New Password"].map(
          (label) => (
            <div key={label}>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                {label}
              </label>
              <input type="password" placeholder="••••••••" className={inp} />
            </div>
          ),
        )}
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition">
          <CheckCircle size={14} /> Update Password
        </button>
      </div>
      <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
        <p className="text-sm font-semibold text-red-700 mb-1">Danger Zone</p>
        <p className="text-xs text-red-500 mb-3">
          Once you delete your account, there is no going back.
        </p>
        <button className="text-xs font-medium text-red-600 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-100 transition">
          Delete Account
        </button>
      </div>
    </div>
  );

  const pages: Record<string, React.ReactNode> = {
    overview: PageOverview,
    profile: PageProfile,
    jobs: PageJobs,
    applications: PageApplications,
    saved: PageSaved,
    notifications: PageNotifications,
    settings: PageSettings,
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar — fixed, never re-mounts */}
      {Sidebar}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="text-base font-semibold text-gray-800 capitalize">
            {NAV.find((n) => n.id === page)?.label ?? "Dashboard"}
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage("notifications")}
              className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
            >
              <Bell size={17} />
            </button>
            <div
              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold cursor-pointer"
              onClick={() => setPage("profile")}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{pages[page]}</main>
      </div>
    </div>
  );
}

// ─── Reusable sub-components ─────────────────────────────────
function ProfileSection({
  title,
  icon,
  onAdd,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-blue-500">{icon}</span>
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition font-medium"
        >
          <Plus size={12} /> Add
        </button>
      </div>
      {children}
    </div>
  );
}

function ModalOverlay({
  onClose,
  title,
  children,
}: {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
