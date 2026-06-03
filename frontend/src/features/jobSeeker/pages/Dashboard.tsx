/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Award,
  Code,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Eye,
  AlertCircle,
  Loader2,
  ChevronDown,
  Menu,
  Heart,
} from "lucide-react";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import api from "../../../services/api";
import { RootState, AppDispatch } from "../../../store";
import {
  fetchJobs,
  fetchBookmarks,
  fetchApplications,
} from "../jobSeekerSlice";

// ─── Types ────────────────────────────────────────────────────
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
  resume_url?: string;
  skills: Skill[];
  certificates: Certificate[];
  projects: Project[];
  education: Education[];
  experience: Experience[];
  languages: { name: string; level: string }[];
  availability: string;
  expectedSalary: string;
}

// ─── Constants ────────────────────────────────────────────────
const NAV = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={16} /> },
  { id: "profile", label: "My Profile", icon: <User size={16} /> },
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
const inp =
  "w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition placeholder:text-gray-300";
const genId = () => Math.random().toString(36).slice(2, 9);
const PROFILE_KEY = "jobseeker_profile_draft";

// ─── Dashboard Navbar ─────────────────────────────────────────
function DashboardNavbar({
  user,
  onLogout,
  onNavigate,
}: {
  user: any;
  onLogout: () => void;
  onNavigate: (p: string) => void;
}) {
  const [profDrop, setProfDrop] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setProfDrop(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const initial =
    user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <nav className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 shrink-0 z-40 relative">
      <Link to="/" className="flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
          <Briefcase size={13} className="text-white" />
        </div>
        <span className="font-bold text-base text-gray-900">JobPortal</span>
      </Link>

      <div className="hidden md:flex items-center gap-1">
        <Link
          to="/jobs"
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          Find Jobs
        </Link>
        <Link
          to="/companies"
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          Companies
        </Link>
        <Link
          to="/career-tips"
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          Career Tips
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate("notifications")}
          className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setProfDrop(!profDrop)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 bg-white transition-colors"
          >
            <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
              {initial}
            </div>
            <span className="text-sm font-medium text-gray-800 hidden sm:block max-w-25 truncate">
              {user?.name || user?.email?.split("@")[0] || "Account"}
            </span>
            <ChevronDown
              size={13}
              className={`text-gray-400 transition-transform ${profDrop ? "rotate-180" : ""}`}
            />
          </button>
          {profDrop && (
            <div className="absolute top-full right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100 mb-1">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name || user?.email?.split("@")[0]}
                </p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                <span className="mt-1 inline-block text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  Job Seeker
                </span>
              </div>
              {[
                {
                  label: "Dashboard",
                  page: "overview",
                  icon: <LayoutDashboard size={14} className="text-gray-400" />,
                },
                {
                  label: "My Profile",
                  page: "profile",
                  icon: <User size={14} className="text-gray-400" />,
                },
                {
                  label: "My Applications",
                  page: "applications",
                  icon: <FileText size={14} className="text-gray-400" />,
                },
                {
                  label: "Saved Jobs",
                  page: "saved",
                  icon: <Heart size={14} className="text-gray-400" />,
                },
                {
                  label: "Settings",
                  page: "settings",
                  icon: <Settings size={14} className="text-gray-400" />,
                },
              ].map((item) => (
                <button
                  key={item.page}
                  onClick={() => {
                    setProfDrop(false);
                    onNavigate(item.page);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {item.icon} {item.label}
                </button>
              ))}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={() => {
                    setProfDrop(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute top-14 left-0 right-0 bg-white border-b border-gray-100 shadow-lg z-50 md:hidden">
          <div className="px-4 py-3 space-y-1">
            <Link
              to="/jobs"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Find Jobs
            </Link>
            <Link
              to="/companies"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Companies
            </Link>
            <Link
              to="/career-tips"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Career Tips
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Main Component ───────────────────────────────────────────
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
  const initials = (user?.name ?? user?.email ?? "U").slice(0, 2).toUpperCase();

  const [page, setPage] = useState<string>("overview");

  // ── Profile — load from localStorage first ────────────────
  const getInitialProfile = (): ProfileData => {
    try {
      const draft = localStorage.getItem(PROFILE_KEY);
      if (draft) return JSON.parse(draft);
    } catch {}
    return {
      fullName:
        user?.fullName ?? user?.name ?? user?.email?.split("@")[0] ?? "",
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
    };
  };

  const [profile, setProfile] = useState<ProfileData>(getInitialProfile);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");
  const avatarRef = useRef<HTMLInputElement>(null);
  const resumeRef = useRef<HTMLInputElement>(null);

  const [editSection, setEditSection] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState<Skill>({
    name: "",
    level: "Intermediate",
  });
  const [newCert, setNewCert] = useState<Certificate>({
    id: "",
    name: "",
    issuer: "",
    date: "",
    url: "",
    credentialId: "",
  });
  const [newProj, setNewProj] = useState<Project>({
    id: "",
    title: "",
    description: "",
    technologies: [],
    url: "",
    githubUrl: "",
  });
  const [projTechInput, setProjTechInput] = useState("");
  const [newEdu, setNewEdu] = useState<Education>({
    id: "",
    school: "",
    degree: "",
    field: "",
    startYear: "",
    endYear: "",
    current: false,
  });
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
  const [newLang, setNewLang] = useState({ name: "", level: "Conversational" });
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");

  // Save profile to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {}
  }, [profile]);

  // Load data on mount
  useEffect(() => {
    dispatch(fetchJobs({}));
    dispatch(fetchBookmarks());
    dispatch(fetchApplications());

    api
      .get("/jobseeker/profile")
      .then((res) => {
        const server = res.data;
        console.log("Profile from backend:", server);
        setProfile((prev) => ({
          ...prev,
          fullName: server.fullName || prev.fullName,
          phone: server.phone || prev.phone,
          location: server.location || prev.location,
          skills: server.skills || prev.skills,
          avatarUrl: server.avatarUrl || prev.avatarUrl,
        }));
        if (server.resumeUrl) setResumeUrl(server.resumeUrl);
      })
      .catch((err) => console.error("Profile fetch error:", err));
  }, [dispatch]);
  // ── FIX: handleLogout defined BEFORE Sidebar ─────────────
  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to sign out?")) return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem(PROFILE_KEY);
    navigate("/login");
  };

  const saveProfile = async () => {
    setProfileLoading(true);
    setProfileError("");
    try {
      const payload: any = {};
      if (profile.fullName && profile.fullName.trim() !== "")
        payload.fullName = profile.fullName;
      if (profile.phone && profile.phone.trim() !== "")
        payload.phone = profile.phone;
      if (profile.location && profile.location.trim() !== "")
        payload.location = profile.location;
      if (profile.skills && profile.skills.length > 0)
        payload.skills = profile.skills;
      if (resumeUrl && resumeUrl.trim() !== "") {
        payload.resumeUrl = resumeUrl;
        payload.resume_url = resumeUrl;
      }
      if (profile.avatarUrl && profile.avatarUrl.trim() !== "") {
        payload.avatarUrl = profile.avatarUrl;
        payload.avatar_url = profile.avatarUrl;
      }
      if (Object.keys(payload).length === 0) {
        setProfileSaved(false);
        return;
      }
      await api.put("/jobseeker/profile", payload);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (error: any) {
      console.error("Save profile error:", error);
      setProfileError(error.response?.data?.error || "Failed to save profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setProfileError("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileError("Image must be less than 2MB");
      return;
    }
    setProfileLoading(true);
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const { data } = await api.post("/jobseeker/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile((prev) => ({ ...prev, avatarUrl: data.url }));
      await saveProfile(); // immediately save
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      setProfileError(err.response?.data?.error || "Failed to upload avatar");
    } finally {
      setProfileLoading(false);
    }
  };

  // ── FIX #3: uploadResume — saves URL to DB so applyToJob can read it ────────
  const uploadResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeUploading(true);
    setProfileError("");

    try {
      const fd = new FormData();
      fd.append("resume", file);

      // POST to /jobseeker/resume — backend saves resume_url to DB
      const { data } = await api.post("/jobseeker/resume", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const url = data.url || data.resumeUrl || URL.createObjectURL(file);
      setResumeUrl(url);

      // Also save resumeUrl inside profile so it persists across page switches
      setProfile((p) => {
        const updated = { ...p };
        localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
        return updated;
      });
      localStorage.setItem("jobseeker_resume_url", url);
    } catch (err: any) {
      console.error("Resume upload error:", err);
      setProfileError(
        err.response?.data?.error || "Resume upload failed. Please try again.",
      );
      // Fallback: keep local object URL so UI doesn't break
      setResumeUrl(URL.createObjectURL(file));
    } finally {
      setResumeUploading(false);
    }
  };

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

  // ── Sidebar — handleLogout is now defined above ───────────
  const Sidebar = (
    <aside className="w-56 bg-white border-r border-gray-100 flex flex-col shrink-0 overflow-y-auto">
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
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Profile strength</span>
            <span className="text-xs font-medium text-blue-600">
              {completionPct}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </div>

      <nav className="flex-1 py-3 px-3">
        <ul className="space-y-0.5">
          {NAV.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setPage(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${page === item.id ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
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

      <div className="border-t border-gray-100 px-3 py-3 shrink-0">
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
        <Link
          to="/jobs"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition shadow-sm"
        >
          <Search size={14} /> Find Jobs
        </Link>
      </div>

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
            value: applications.filter((a: any) => a.status === "Interview")
              .length,
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
            path: "overview",
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

      {completionPct < 100 && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
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
            className="text-xs font-semibold text-blue-700 bg-white border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition shrink-0"
          >
            Complete Profile
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">
              Recommended for You
            </h3>
            <Link
              to="/jobs"
              className="text-xs text-blue-600 font-medium flex items-center gap-1"
            >
              See all <ChevronRight size={12} />
            </Link>
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
              : jobs.slice(0, 4).map((job: any) => (
                  <div
                    key={job.id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition"
                  >
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
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
                      className="text-xs text-blue-600 font-medium shrink-0"
                    >
                      Apply →
                    </Link>
                  </div>
                ))}
          </div>
        </div>

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
            <Link
              to="/career-tips"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-50 text-sm text-gray-700 transition"
            >
              <TrendingUp size={13} className="text-violet-500" /> Career Tips
              (AI)
              <ChevronRight size={12} className="ml-auto text-gray-300" />
            </Link>
          </div>

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
                {applications.slice(0, 3).map((app: any) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <p className="text-xs font-medium text-gray-700 truncate flex-1">
                      {app.jobTitle}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-medium ml-2 shrink-0 ${statusColor[app.status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}
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

  // ─── PAGE: Profile ────────────────────────────────────────────
  const PageProfile = (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">My Profile</h2>
          <p className="text-sm text-gray-500">
            Your public profile · {completionPct}% complete
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
        <div className="h-20 bg-linear-to-r from-blue-500 to-indigo-600" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-8 mb-4">
            <div className="relative">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Avatar"
                  className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-md border-4 border-white">
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
            <div className="pb-1">
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

          <textarea
            value={profile.bio}
            onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
            rows={3}
            placeholder="Write a compelling summary about yourself..."
            className="w-full text-sm text-gray-700 bg-transparent border-none outline-none resize-none placeholder:text-gray-300 leading-relaxed"
          />

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
                icon: <FaLinkedin size={13} />,
                key: "linkedin",
                placeholder: "LinkedIn URL",
                type: "url",
              },
              {
                icon: <FaGithub size={13} />,
                key: "github",
                placeholder: "GitHub URL",
                type: "url",
              },
            ].map((f) => (
              <div
                key={f.key}
                className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2"
              >
                <span className="text-gray-400 shrink-0">{f.icon}</span>
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

      {/* Resume */}
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
            <FileText size={18} className="text-green-600 shrink-0" />
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
          <p className="text-sm text-gray-400 py-2">No skills added yet.</p>
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
                  placeholder="e.g. React, Python"
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
            Add your professional certifications.
          </p>
        ) : (
          profile.certificates.map((c) => (
            <div
              key={c.id}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl mb-2"
            >
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                <Award size={16} className="text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                <p className="text-xs text-gray-500">
                  {c.issuer} · {c.date}
                </p>
                {c.url && (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                  >
                    <ExternalLink size={10} /> View
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
                className="text-gray-300 hover:text-red-400 transition shrink-0"
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
          <p className="text-sm text-gray-400 py-2">Add your work history.</p>
        ) : (
          profile.experience.map((e) => (
            <div key={e.id} className="flex gap-3 mb-4 last:mb-0">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
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
                className="text-gray-300 hover:text-red-400 transition shrink-0"
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
                  placeholder: "e.g. Remote, Addis Ababa",
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
                    placeholder="Jan 2021"
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
                    placeholder="Dec 2023"
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
                  placeholder="Describe your responsibilities..."
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
              <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
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
                  placeholder: "e.g. Bachelor's, Master's",
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

  // ─── PAGE: Applications ───────────────────────────────────────
  const PageApplications = (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-gray-900">My Applications</h2>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {applications.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">No applications yet</p>
            <Link
              to="/jobs"
              className="mt-3 inline-block text-sm text-blue-600 underline"
            >
              Browse jobs
            </Link>
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
              {applications.map((app: any) => (
                <div
                  key={app.id}
                  className="grid grid-cols-5 gap-2 items-center px-5 py-4 hover:bg-gray-50 transition"
                >
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
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

  // ─── PAGE: Saved Jobs ─────────────────────────────────────────
  const PageSaved = (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-gray-900">Saved Jobs</h2>
      {bookmarks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
          <Bookmark size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">No saved jobs yet</p>
          <Link
            to="/jobs"
            className="mt-3 inline-block text-sm text-blue-600 underline"
          >
            Browse jobs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bookmarks.map((bm: any) => {
            // FIX: use bm.job from the bookmark (returned by backend with include)
            // fallback to searching jobs array if bm.job not present
            const job = bm.job || jobs.find((j: any) => j.id === bm.jobId);
            return (
              <div
                key={bm.jobId}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                    <Bookmark
                      size={14}
                      className="text-amber-500"
                      fill="currentColor"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {job?.title ?? "Job #" + bm.jobId}
                    </p>
                    {job && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {job.company} · {job.location}
                      </p>
                    )}
                  </div>
                </div>

                {job && (
                  <>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.employmentType && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          {job.employmentType}
                        </span>
                      )}
                      {job.industry && (
                        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                          {job.industry}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                      <span className="text-sm font-semibold text-gray-800">
                        {job.salaryRange || "Competitive"}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => dispatch(bookmarkJob(bm.jobId))}
                          className="text-xs text-red-400 hover:text-red-600 transition"
                          title="Remove bookmark"
                        >
                          Remove
                        </button>
                        <Link
                          to={`/jobs/${job.id || bm.jobId}`}
                          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-xl hover:bg-blue-700 transition font-medium"
                        >
                          Apply Now
                        </Link>
                      </div>
                    </div>
                  </>
                )}

                {/* If job details not loaded yet */}
                {!job && (
                  <div className="mt-3 pt-3 border-t border-gray-50 flex justify-end">
                    <Link
                      to={`/jobs/${bm.jobId}`}
                      className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-xl hover:bg-blue-700 transition font-medium"
                    >
                      View Job
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

  // ─── PAGE: Notifications ──────────────────────────────────────
  const PageNotifications = (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
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

  // ─── PAGE: Settings ───────────────────────────────────────────
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
    applications: PageApplications,
    saved: PageSaved,
    notifications: PageNotifications,
    settings: PageSettings,
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <DashboardNavbar
        user={user}
        onLogout={handleLogout}
        onNavigate={setPage}
      />
      <div className="flex flex-1 overflow-hidden">
        {Sidebar}
        <main className="flex-1 overflow-y-auto p-6">{pages[page]}</main>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────
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
