/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import api from "../../services/api";
import {
  User,
  Bell,
  Lock,
  Palette,
  Shield,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  Monitor,
  Moon,
  Sun,
  Camera,
  Smartphone,
  Laptop,
  Key,
  Download,
  LogOut,
  Plus,
} from "lucide-react";

type Tab =
  | "profile"
  | "password"
  | "notifications"
  | "theme"
  | "privacy"
  | "security"
  | "api"
  | "danger";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile", icon: <User size={15} /> },
  { id: "password", label: "Password", icon: <Lock size={15} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={15} /> },
  { id: "theme", label: "Appearance", icon: <Palette size={15} /> },
  { id: "privacy", label: "Privacy", icon: <Shield size={15} /> },
  { id: "security", label: "Security", icon: <Shield size={15} /> },
  { id: "api", label: "API Keys", icon: <Key size={15} /> },
  { id: "danger", label: "Danger Zone", icon: <Trash2 size={15} /> },
];

const inp =
  "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition bg-white placeholder:text-gray-300";

type ThemeColor = "blue" | "green" | "violet" | "rose" | "amber";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
        checked ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

function Alert({ type, msg }: { type: "success" | "error"; msg: string }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm mb-5 ${
        type === "success"
          ? "bg-green-50 border border-green-200 text-green-700"
          : "bg-red-50 border border-red-200 text-red-600"
      }`}
    >
      {type === "success" ? (
        <CheckCircle size={16} />
      ) : (
        <AlertCircle size={16} />
      )}{" "}
      {msg}
    </div>
  );
}

// Mock data (sessions, API keys)
const mockSessions = [
  {
    id: "s1",
    device: "Chrome on Windows",
    location: "Addis Ababa, Ethiopia",
    lastActive: "2025-05-22 14:30",
    current: true,
  },
  {
    id: "s2",
    device: "Safari on iPhone",
    location: "Addis Ababa, Ethiopia",
    lastActive: "2025-05-21 09:15",
    current: false,
  },
  {
    id: "s3",
    device: "Firefox on MacBook",
    location: "Nairobi, Kenya",
    lastActive: "2025-05-19 22:10",
    current: false,
  },
];
const mockApiKeys = [
  {
    id: "k1",
    name: "Production API",
    key: "jp_live_abc123...",
    createdAt: "2025-01-15",
    lastUsed: "2025-05-20",
  },
  {
    id: "k2",
    name: "Development",
    key: "jp_test_xyz789...",
    createdAt: "2025-03-10",
    lastUsed: "2025-05-21",
  },
];

export default function EmployerSettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");
  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // User
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : {};
  const [profile, setProfile] = useState({
    email: user?.email ?? "",
    fullName: user?.fullName ?? "",
    phone: "",
    avatarUrl: user?.avatarUrl ?? "",
    timezone: "Africa/Addis_Ababa",
    language: "English",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1,234.56",
  });

  // Password
  const [pwd, setPwd] = useState({ current: "", newPwd: "", confirm: "" });
  const [showPwd, setShowPwd] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Notifications
  type NotifEvent = { email: boolean; inApp: boolean };
  type NotifType = {
    newApplicant: NotifEvent;
    applicationStatus: NotifEvent;
    jobExpiry: NotifEvent;
    weeklyReport: NotifEvent;
    marketing: NotifEvent;
    sms: boolean;
  };
  const [notif, setNotif] = useState<NotifType>({
    newApplicant: { email: true, inApp: true },
    applicationStatus: { email: true, inApp: true },
    jobExpiry: { email: true, inApp: true },
    weeklyReport: { email: false, inApp: false },
    marketing: { email: false, inApp: false },
    sms: false,
  });

  // Theme
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [accent, setAccent] = useState<ThemeColor>("blue");
  const [compact, setCompact] = useState(false);
  const [animations, setAnimations] = useState(true);

  // Privacy
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
    analyticsTracking: true,
  });

  // Security
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState(mockSessions);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [apiKeys, setApiKeys] = useState(mockApiKeys);
  const [newApiKeyName, setNewApiKeyName] = useState("");

  // Theme effect
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else if (theme === "system") {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      if (systemDark) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const flash = (type: "success" | "error", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  // Avatar upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfile((p) => ({ ...p, avatarUrl: url }));
      flash("success", "Avatar uploaded. Save changes to keep it.");
    }
  };

  // Save handlers (same as before)
  const saveProfile = async () => {
    setLoading(true);
    try {
      await api.put("/employer/account", profile);
      const updatedUser = {
        ...user,
        fullName: profile.fullName,
        email: profile.email,
        avatarUrl: profile.avatarUrl,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      flash("success", "Account settings saved.");
    } catch {
      flash("error", "Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };
  const savePassword = async () => {
    if (pwd.newPwd.length < 6) {
      flash("error", "New password must be at least 6 characters.");
      return;
    }
    if (pwd.newPwd !== pwd.confirm) {
      flash("error", "Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/employer/change-password", {
        currentPassword: pwd.current,
        newPassword: pwd.newPwd,
      });
      flash("success", "Password changed.");
      setPwd({ current: "", newPwd: "", confirm: "" });
    } catch (e: any) {
      flash(
        "error",
        e.response?.data?.error ?? "Current password is incorrect.",
      );
    } finally {
      setLoading(false);
    }
  };
  const saveNotifications = async () => {
    setLoading(true);
    try {
      await api.put("/employer/notification-preferences", notif);
      flash("success", "Notification preferences saved.");
    } catch {
      flash("error", "Failed to save preferences.");
    } finally {
      setLoading(false);
    }
  };
  const saveAppearance = async () => {
    setLoading(true);
    try {
      await api.put("/employer/appearance", {
        theme,
        accent,
        compact,
        animations,
      });
      flash("success", "Appearance saved.");
    } catch {
      flash("error", "Failed to save appearance.");
    } finally {
      setLoading(false);
    }
  };
  const savePrivacy = async () => {
    setLoading(true);
    try {
      await api.put("/employer/privacy", privacy);
      flash("success", "Privacy settings saved.");
    } catch {
      flash("error", "Failed to save privacy.");
    } finally {
      setLoading(false);
    }
  };
  const enable2FA = () => {
    setTwoFactorEnabled(true);
    setShow2FASetup(false);
    flash("success", "Two-factor authentication enabled.");
  };
  const logoutOtherDevices = async () => {
    setLoading(true);
    try {
      await api.post("/auth/logout-others");
      setSessions(sessions.filter((s) => s.current));
      flash("success", "Logged out from all other devices.");
    } catch {
      flash("error", "Failed to log out other devices.");
    } finally {
      setLoading(false);
    }
  };
  const generateApiKey = () => {
    if (!newApiKeyName.trim()) {
      flash("error", "Please enter a name for the API key.");
      return;
    }
    const newKey = {
      id: `k${Date.now()}`,
      name: newApiKeyName.trim(),
      key: `jp_${Math.random().toString(36).substring(2, 15)}...`,
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
    };
    setApiKeys([...apiKeys, newKey]);
    setNewApiKeyName("");
    flash("success", `API key "${newKey.name}" generated.`);
  };
  const revokeApiKey = (id: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
    flash("success", "API key revoked.");
  };
  const deactivateAccount = () => {
    if (window.confirm("Deactivate your account? Your data will be preserved."))
      flash("success", "Account deactivated.");
  };
  const deleteAccount = () => {
    if (window.confirm("⚠️ Permanent action. Are you absolutely sure?"))
      flash("error", "Account deletion is not available.");
  };
  const exportData = async () => {
    flash("success", "Data export requested (mock).");
  };

  const themeColors: { key: ThemeColor; cls: string; label: string }[] = [
    { key: "blue", cls: "bg-blue-500", label: "Ocean Blue" },
    { key: "green", cls: "bg-green-500", label: "Forest Green" },
    { key: "violet", cls: "bg-violet-500", label: "Royal Violet" },
    { key: "rose", cls: "bg-rose-500", label: "Rose Red" },
    { key: "amber", cls: "bg-amber-500", label: "Golden Amber" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500">
          Manage your account, appearance, and preferences
        </p>
      </div>

      {/* TOP NAVBAR (horizontal tabs) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <div className="flex flex-nowrap gap-1 p-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setMsg(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.id
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              } ${t.id === "danger" ? "text-red-500 hover:bg-red-50" : ""}`}
            >
              <span
                className={
                  tab === t.id
                    ? "text-blue-500"
                    : t.id === "danger"
                      ? "text-red-400"
                      : "text-gray-400"
                }
              >
                {t.icon}
              </span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content area (no left sidebar) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {msg && <Alert type={msg.type} msg={msg.text} />}

        {/* Profile Tab */}
        {tab === "profile" && (
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3">
              Profile & Account
            </h3>
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={40} className="text-gray-400" />
                  )}
                </div>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1 shadow-sm hover:bg-blue-700"
                >
                  <Camera size={14} className="text-white" />
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Profile picture</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Full Name
                </label>
                <input
                  value={profile.fullName}
                  onChange={(e) =>
                    setProfile({ ...profile, fullName: e.target.value })
                  }
                  placeholder="Your full name"
                  className={inp}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  className={inp}
                />
                {privacy.showEmail && (
                  <p className="text-xs text-gray-400 mt-1">
                    (Email is publicly visible)
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Phone Number
                </label>
                <input
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  placeholder="+251 9XX XXX XXX"
                  className={inp}
                />
                {privacy.showPhone && (
                  <p className="text-xs text-gray-400 mt-1">
                    (Phone is publicly visible)
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Timezone
                </label>
                <select
                  value={profile.timezone}
                  onChange={(e) =>
                    setProfile({ ...profile, timezone: e.target.value })
                  }
                  className={inp + " appearance-none"}
                >
                  <option>Africa/Addis_Ababa</option>
                  <option>Africa/Nairobi</option>
                  <option>Africa/Lagos</option>
                  <option>Europe/London</option>
                  <option>America/New_York</option>
                  <option>Asia/Dubai</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Language
                </label>
                <select
                  value={profile.language}
                  onChange={(e) =>
                    setProfile({ ...profile, language: e.target.value })
                  }
                  className={inp + " appearance-none"}
                >
                  <option>English</option>
                  <option>Amharic</option>
                  <option>French</option>
                  <option>Arabic</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Date Format
                </label>
                <select
                  value={profile.dateFormat}
                  onChange={(e) =>
                    setProfile({ ...profile, dateFormat: e.target.value })
                  }
                  className={inp + " appearance-none"}
                >
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Number Format
                </label>
                <select
                  value={profile.numberFormat}
                  onChange={(e) =>
                    setProfile({ ...profile, numberFormat: e.target.value })
                  }
                  className={inp + " appearance-none"}
                >
                  <option>1,234.56</option>
                  <option>1.234,56</option>
                  <option>1 234,56</option>
                </select>
              </div>
            </div>
            <button
              onClick={saveProfile}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle size={14} />
              )}
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}

        {/* Password Tab (unchanged) */}
        {tab === "password" && (
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3">
              Change Password
            </h3>
            <div className="max-w-sm space-y-4">
              {[
                {
                  key: "current",
                  label: "Current Password",
                  show: showPwd.current,
                  toggle: () =>
                    setShowPwd((p) => ({ ...p, current: !p.current })),
                },
                {
                  key: "newPwd",
                  label: "New Password",
                  show: showPwd.new,
                  toggle: () => setShowPwd((p) => ({ ...p, new: !p.new })),
                },
                {
                  key: "confirm",
                  label: "Confirm New Password",
                  show: showPwd.confirm,
                  toggle: () =>
                    setShowPwd((p) => ({ ...p, confirm: !p.confirm })),
                },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    {f.label}
                  </label>
                  <div className="relative">
                    <input
                      type={f.show ? "text" : "password"}
                      value={pwd[f.key as keyof typeof pwd]}
                      onChange={(e) =>
                        setPwd((p) => ({ ...p, [f.key]: e.target.value }))
                      }
                      placeholder="••••••••"
                      className={inp + " pr-10"}
                    />
                    <button
                      type="button"
                      onClick={f.toggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {f.show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}
              {pwd.newPwd && (
                <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Password strength
                  </p>
                  {[
                    {
                      label: "At least 6 characters",
                      ok: pwd.newPwd.length >= 6,
                    },
                    { label: "Contains a number", ok: /\d/.test(pwd.newPwd) },
                    {
                      label: "Contains uppercase letter",
                      ok: /[A-Z]/.test(pwd.newPwd),
                    },
                    {
                      label: "Contains special character",
                      ok: /[^A-Za-z0-9]/.test(pwd.newPwd),
                    },
                  ].map((r) => (
                    <p
                      key={r.label}
                      className={`text-xs flex items-center gap-1.5 ${r.ok ? "text-green-600" : "text-gray-400"}`}
                    >
                      <CheckCircle
                        size={11}
                        className={r.ok ? "text-green-500" : "text-gray-300"}
                      />{" "}
                      {r.label}
                    </p>
                  ))}
                </div>
              )}
              <button
                onClick={savePassword}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Lock size={14} />
                )}
                {loading ? "Saving..." : "Update Password"}
              </button>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {tab === "notifications" && (
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3">
              Notification Preferences
            </h3>
            <div className="space-y-3">
              {(() => {
                const events = [
                  {
                    key: "newApplicant",
                    label: "New Applicant",
                    desc: "When someone applies to your job posts",
                  },
                  {
                    key: "applicationStatus",
                    label: "Application Updates",
                    desc: "When you update an applicant's status",
                  },
                  {
                    key: "jobExpiry",
                    label: "Job Expiry Reminders",
                    desc: "3 days before a job post expires",
                  },
                  {
                    key: "weeklyReport",
                    label: "Weekly Summary Report",
                    desc: "Weekly overview of your hiring activity",
                  },
                  {
                    key: "marketing",
                    label: "Tips & Product Updates",
                    desc: "JobPortal tips, feature announcements",
                  },
                ];
                return events.map((n) => {
                  const val = notif[n.key as keyof NotifType] as NotifEvent;
                  return (
                    <div
                      key={n.key}
                      className="p-3.5 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {n.label}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {n.desc}
                          </p>
                        </div>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-1 text-xs text-gray-500">
                            <input
                              type="checkbox"
                              checked={val.email}
                              onChange={(e) =>
                                setNotif((prev) => ({
                                  ...prev,
                                  [n.key]: { ...val, email: e.target.checked },
                                }))
                              }
                              className="rounded"
                            />{" "}
                            Email
                          </label>
                          <label className="flex items-center gap-1 text-xs text-gray-500">
                            <input
                              type="checkbox"
                              checked={val.inApp}
                              onChange={(e) =>
                                setNotif((prev) => ({
                                  ...prev,
                                  [n.key]: { ...val, inApp: e.target.checked },
                                }))
                              }
                              className="rounded"
                            />{" "}
                            In-app
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    SMS Notifications
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Receive key alerts via text message
                  </p>
                </div>
                <Toggle
                  checked={notif.sms}
                  onChange={(v) => setNotif((p) => ({ ...p, sms: v }))}
                />
              </div>
            </div>
            <button
              onClick={saveNotifications}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition mt-2"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle size={14} />
              )}
              Save Preferences
            </button>
          </div>
        )}

        {/* Theme / Appearance Tab */}
        {tab === "theme" && (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3">
              Appearance
            </h3>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-3">
                Theme Mode
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: "light", label: "Light", icon: <Sun size={18} /> },
                  { key: "dark", label: "Dark", icon: <Moon size={18} /> },
                  {
                    key: "system",
                    label: "System",
                    icon: <Monitor size={18} />,
                  },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() =>
                      setTheme(t.key as "light" | "dark" | "system")
                    }
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${theme === t.key ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <span
                      className={
                        theme === t.key ? "text-blue-600" : "text-gray-400"
                      }
                    >
                      {t.icon}
                    </span>
                    <span
                      className={`text-xs font-medium ${theme === t.key ? "text-blue-700" : "text-gray-600"}`}
                    >
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-3">
                Accent Color
              </p>
              <div className="flex gap-3">
                {themeColors.map((c) => (
                  <button
                    key={c.key}
                    title={c.label}
                    onClick={() => setAccent(c.key)}
                    className={`w-9 h-9 ${c.cls} rounded-full transition-transform hover:scale-110 ${accent === c.key ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""}`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Selected: {themeColors.find((c) => c.key === accent)?.label}
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-600">
                Display Options
              </p>
              <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Compact Mode
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Reduce spacing for a denser layout
                  </p>
                </div>
                <Toggle checked={compact} onChange={setCompact} />
              </div>
              <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Animations
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Enable smooth transitions and animations
                  </p>
                </div>
                <Toggle checked={animations} onChange={setAnimations} />
              </div>
            </div>
            <button
              onClick={saveAppearance}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition"
            >
              <CheckCircle size={14} /> Save Appearance
            </button>
          </div>
        )}

        {/* Privacy Tab */}
        {tab === "privacy" && (
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3">
              Privacy Settings
            </h3>
            <div className="space-y-3">
              {[
                {
                  key: "profileVisible",
                  label: "Public Company Profile",
                  desc: "Allow job seekers to view your company page",
                },
                {
                  key: "showEmail",
                  label: "Show Email on Profile",
                  desc: "Display your contact email publicly",
                },
                {
                  key: "showPhone",
                  label: "Show Phone on Profile",
                  desc: "Display your phone number publicly",
                },
                {
                  key: "analyticsTracking",
                  label: "Analytics & Tracking",
                  desc: "Help us improve with anonymous usage data",
                },
              ].map((p) => (
                <div
                  key={p.key}
                  className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {p.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.desc}</p>
                  </div>
                  <Toggle
                    checked={privacy[p.key as keyof typeof privacy]}
                    onChange={(v) =>
                      setPrivacy((prev) => ({ ...prev, [p.key]: v }))
                    }
                  />
                </div>
              ))}
            </div>
            <button
              onClick={savePrivacy}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition"
            >
              <CheckCircle size={14} /> Save Privacy Settings
            </button>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Export Your Data
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Download a copy of all your data in JSON format
                  </p>
                </div>
                <button
                  onClick={exportData}
                  className="flex items-center gap-2 text-blue-600 border border-blue-200 bg-blue-50 px-4 py-2 rounded-xl text-sm"
                >
                  <Download size={14} /> Export
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {tab === "security" && (
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3">
              Security
            </h3>
            <div>
              <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Two-Factor Authentication (2FA)
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Add an extra layer of security to your account
                  </p>
                </div>
                {twoFactorEnabled ? (
                  <span className="text-green-600 text-sm font-medium">
                    Enabled
                  </span>
                ) : (
                  <button
                    onClick={() => setShow2FASetup(true)}
                    className="text-blue-600 text-sm font-medium"
                  >
                    Set up
                  </button>
                )}
              </div>
              {show2FASetup && (
                <div className="mt-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm font-medium text-blue-800">
                    Scan this QR code with Google Authenticator
                  </p>
                  <div className="bg-white w-32 h-32 mx-auto my-2 flex items-center justify-center text-gray-400 border">
                    [QR Mock]
                  </div>
                  <p className="text-xs text-blue-700">
                    Enter code:{" "}
                    <input
                      className="w-24 border rounded px-2 py-1 text-sm"
                      placeholder="123456"
                    />
                  </p>
                  <button
                    onClick={enable2FA}
                    className="mt-2 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    Verify & Enable
                  </button>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-800">
                  Active Sessions
                </p>
                <button
                  onClick={logoutOtherDevices}
                  className="text-xs text-red-500 flex items-center gap-1"
                >
                  <LogOut size={12} /> Log out others
                </button>
              </div>
              <div className="space-y-2 mt-3">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-full">
                        {sess.device.includes("iPhone") ? (
                          <Smartphone size={16} />
                        ) : (
                          <Laptop size={16} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {sess.device}
                        </p>
                        <p className="text-xs text-gray-400">
                          {sess.location} • Last active {sess.lastActive}
                        </p>
                      </div>
                    </div>
                    {sess.current && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* API Keys Tab */}
        {tab === "api" && (
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3">
              API Keys
            </h3>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Create new API key
              </label>
              <div className="flex gap-2">
                <input
                  value={newApiKeyName}
                  onChange={(e) => setNewApiKeyName(e.target.value)}
                  placeholder="e.g., Production Server"
                  className={inp + " flex-1"}
                />
                <button
                  onClick={generateApiKey}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-1"
                >
                  <Plus size={14} /> Generate
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="p-3.5 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {key.name}
                      </p>
                      <p className="text-xs font-mono text-gray-500 mt-0.5">
                        {key.key}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Created: {key.createdAt} • Last used: {key.lastUsed}
                      </p>
                    </div>
                    <button
                      onClick={() => revokeApiKey(key.id)}
                      className="text-red-500 text-xs border border-red-200 bg-red-50 px-2 py-1 rounded-lg"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Danger Zone Tab */}
        {tab === "danger" && (
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-red-600 border-b border-red-100 pb-3">
              Danger Zone
            </h3>
            <div className="space-y-4">
              <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-amber-800">
                  Deactivate Account
                </p>
                <p className="text-xs text-amber-700 mt-1 mb-3">
                  Temporarily disable your account. Your data will be preserved
                  and you can reactivate anytime.
                </p>
                <button
                  onClick={deactivateAccount}
                  className="text-xs font-medium text-amber-700 border border-amber-300 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-lg transition"
                >
                  Deactivate Account
                </button>
              </div>
              <div className="border border-red-200 bg-red-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-700">
                  Delete Account
                </p>
                <p className="text-xs text-red-600 mt-1 mb-3">
                  Permanently delete your account and all data. This action
                  cannot be undone.
                </p>
                <button
                  onClick={deleteAccount}
                  className="text-xs font-medium text-red-700 border border-red-300 bg-red-100 hover:bg-red-200 px-4 py-2 rounded-lg transition"
                >
                  Delete My Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
