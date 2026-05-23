/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import api from "../../services/api";
import {
  Building2,
  Globe,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  Camera,
  Award,
  Link as LinkIcon,
} from "lucide-react";

interface Industry {
  id: number;
  industry_name: string;
}
interface Profile {
  company_name: string;
  tagline: string;
  website: string;
  logo_url: string;
  cover_url: string;
  industry_id: number;
  location: string;
  phone: string;
  email: string;
  founded_year: string;
  company_size: string;
  company_type: string;
  description: string;
  mission: string;
  linkedin: string;
  twitter: string;
  facebook: string;
  specialties: string[];
}

const inp =
  "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition bg-white placeholder:text-gray-300";

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    company_name: "",
    tagline: "",
    website: "",
    logo_url: "",
    cover_url: "",
    industry_id: 0,
    location: "",
    phone: "",
    email: "",
    founded_year: "",
    company_size: "",
    company_type: "",
    description: "",
    mission: "",
    linkedin: "",
    twitter: "",
    facebook: "",
    specialties: [],
  });
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [activeTab, setTab] = useState<"info" | "about" | "social">("info");
  const [specInput, setSpecInput] = useState("");
  const logoRef = useRef<HTMLInputElement>(null);

  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const initials =
    profile.company_name?.slice(0, 2).toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() ||
    "CO";

  useEffect(() => {
    Promise.all([api.get("/employer/profile"), api.get("/admin/categories")])
      .then(([p, i]) => {
        setProfile((prev) => ({ ...prev, ...p.data }));
        setIndustries(i.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) =>
    setProfile((p) => ({ ...p, [k]: v }));

  const flash = (type: "success" | "error", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  const save = async () => {
    if (!profile.company_name.trim()) {
      flash("error", "Company name is required.");
      return;
    }
    if (!profile.industry_id) {
      flash("error", "Please select an industry.");
      return;
    }
    setSaving(true);
    try {
      await api.put("/employer/profile", profile);
      flash("success", "Company profile updated successfully.");
    } catch {
      flash("error", "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const addSpecialty = () => {
    const val = specInput.trim();
    if (!val || profile.specialties.includes(val)) return;
    set("specialties", [...profile.specialties, val]);
    setSpecInput("");
  };

  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    set("logo_url", url);
  };

  const completionFields = [
    profile.company_name,
    profile.description,
    profile.location,
    profile.website,
    profile.industry_id,
    profile.company_size,
    profile.phone,
    profile.logo_url,
  ];
  const completionPct = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100,
  );

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto animate-pulse">
        <div className="h-32 bg-gray-100 rounded-2xl" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Company Profile</h2>
          <p className="text-sm text-gray-500">
            How candidates see your company
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm">
            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-600">
              {completionPct}% complete
            </span>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-xl transition shadow-sm"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCircle size={14} />
            )}
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>

      {msg && (
        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${msg.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}
        >
          {msg.type === "success" ? (
            <CheckCircle size={16} />
          ) : (
            <AlertCircle size={16} />
          )}{" "}
          {msg.text}
        </div>
      )}

      {/* Profile hero card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Cover */}
        <div className="h-28 bg-linear-to-r from-blue-500 to-indigo-600 relative">
          <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fill-rule=evenodd%3E%3Cg fill=%23ffffff fill-opacity=0.4%3E%3Cpath d=M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        </div>

        <div className="px-6 pb-5">
          {/* Logo + company name */}
          <div className="flex items-end gap-4 -mt-10 mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-white shadow-md border-2 border-white flex items-center justify-center overflow-hidden">
                {profile.logo_url ? (
                  <img
                    src={profile.logo_url}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-blue-600">
                    {initials}
                  </span>
                )}
              </div>
              <button
                onClick={() => logoRef.current?.click()}
                className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-sm hover:bg-blue-700 transition"
              >
                <Camera size={11} className="text-white" />
              </button>
              <input
                ref={logoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={uploadLogo}
              />
            </div>
            <div className="flex-1 pb-1">
              <p className="text-lg font-bold text-gray-900">
                {profile.company_name || "Your Company"}
              </p>
              <p className="text-sm text-gray-500">
                {profile.tagline || "Add a tagline to attract candidates"}
              </p>
              {profile.location && (
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <MapPin size={11} />
                  {profile.location}
                </p>
              )}
            </div>
            {completionPct < 100 && (
              <div className="hidden md:flex flex-col items-end">
                <p className="text-xs text-amber-600 font-medium">
                  Profile incomplete
                </p>
                <p className="text-xs text-gray-400">
                  Fill in all fields to attract more applicants
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs + form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tab nav */}
        <div className="flex border-b border-gray-100">
          {[
            {
              id: "info" as const,
              label: "Basic Info",
              icon: <Building2 size={14} />,
            },
            { id: "about" as const, label: "About", icon: <Award size={14} /> },
            {
              id: "social" as const,
              label: "Social Links",
              icon: <LinkIcon size={14} />,
            },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-5 py-3.5 text-sm font-medium border-b-2 transition ${
                activeTab === t.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ── Basic Info ── */}
          {activeTab === "info" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Company Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={profile.company_name}
                    onChange={(e) => set("company_name", e.target.value)}
                    placeholder="Acme Corporation"
                    className={inp}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Tagline
                  </label>
                  <input
                    value={profile.tagline}
                    onChange={(e) => set("tagline", e.target.value)}
                    placeholder="Building the future of work"
                    className={inp}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Industry <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={profile.industry_id}
                    onChange={(e) => set("industry_id", +e.target.value)}
                    className={inp + " appearance-none"}
                  >
                    <option value={0}>Select industry</option>
                    {industries.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.industry_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Company Size
                  </label>
                  <select
                    value={profile.company_size}
                    onChange={(e) => set("company_size", e.target.value)}
                    className={inp + " appearance-none"}
                  >
                    <option value="">Select size</option>
                    {[
                      "1–10",
                      "11–50",
                      "51–200",
                      "201–500",
                      "501–1,000",
                      "1,000–5,000",
                      "5,000+",
                    ].map((s) => (
                      <option key={s}>{s} employees</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Company Type
                  </label>
                  <select
                    value={profile.company_type}
                    onChange={(e) => set("company_type", e.target.value)}
                    className={inp + " appearance-none"}
                  >
                    <option value="">Select type</option>
                    {[
                      "Public",
                      "Private",
                      "Non-profit",
                      "Government",
                      "Startup",
                      "Agency",
                      "Freelance",
                    ].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Founded Year
                  </label>
                  <input
                    value={profile.founded_year}
                    onChange={(e) => set("founded_year", e.target.value)}
                    placeholder="e.g. 2015"
                    className={inp}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Location <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      value={profile.location}
                      onChange={(e) => set("location", e.target.value)}
                      placeholder="City, Country"
                      className={inp + " pl-8"}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Website
                  </label>
                  <div className="relative">
                    <Globe
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="url"
                      value={profile.website}
                      onChange={(e) => set("website", e.target.value)}
                      placeholder="https://yourcompany.com"
                      className={inp + " pl-8"}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Contact Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="hr@yourcompany.com"
                      className={inp + " pl-8"}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      value={profile.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="+251 9XX XXX XXX"
                      className={inp + " pl-8"}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── About ── */}
          {activeTab === "about" && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Company Description <span className="text-red-400">*</span>
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  Tell candidates about your company, culture, and what makes
                  you unique. Aim for 150+ words.
                </p>
                <textarea
                  value={profile.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={7}
                  placeholder="We are a fast-growing technology company focused on..."
                  className={inp + " resize-none"}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {profile.description.length} characters
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Mission Statement
                </label>
                <textarea
                  value={profile.mission}
                  onChange={(e) => set("mission", e.target.value)}
                  rows={3}
                  placeholder="Our mission is to..."
                  className={inp + " resize-none"}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Company Specialties
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  What does your company excel at? These appear as tags on your
                  profile.
                </p>
                <div className="flex gap-2">
                  <input
                    value={specInput}
                    onChange={(e) => setSpecInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSpecialty();
                      }
                    }}
                    placeholder="e.g. Machine Learning, Cloud Computing — press Enter"
                    className={inp + " flex-1"}
                  />
                  <button
                    type="button"
                    onClick={addSpecialty}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition"
                  >
                    Add
                  </button>
                </div>
                {profile.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {profile.specialties.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() =>
                            set(
                              "specialties",
                              profile.specialties.filter((x) => x !== s),
                            )
                          }
                          className="hover:text-red-500 transition text-blue-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Social ── */}
          {activeTab === "social" && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 mb-1">
                Connect your social profiles to build trust with candidates.
              </p>
              {[
                {
                  key: "linkedin" as const,
                  label: "LinkedIn",
                  placeholder: "https://linkedin.com/company/acme",
                  icon: "in",
                },
                {
                  key: "twitter" as const,
                  label: "Twitter/X",
                  placeholder: "https://twitter.com/acmecorp",
                  icon: "𝕏",
                },
                {
                  key: "facebook" as const,
                  label: "Facebook",
                  placeholder: "https://facebook.com/acmecorp",
                  icon: "f",
                },
              ].map((s) => (
                <div key={s.key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    {s.label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-600">
                      {s.icon}
                    </span>
                    <input
                      type="url"
                      value={(profile as any)[s.key]}
                      onChange={(e) => set(s.key, e.target.value)}
                      placeholder={s.placeholder}
                      className={inp + " pl-10"}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Completion tips */}
      {completionPct < 100 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-sm font-semibold text-amber-800 mb-2">
            💡 Complete your profile to attract 3× more applicants
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { done: !!profile.company_name, label: "Company name" },
              { done: !!profile.description, label: "Company description" },
              { done: !!profile.logo_url, label: "Company logo" },
              { done: !!profile.location, label: "Location" },
              { done: !!profile.website, label: "Website" },
              { done: !!profile.company_size, label: "Company size" },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2 text-xs ${item.done ? "text-green-700" : "text-amber-700"}`}
              >
                <CheckCircle
                  size={12}
                  className={item.done ? "text-green-500" : "text-amber-400"}
                />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
