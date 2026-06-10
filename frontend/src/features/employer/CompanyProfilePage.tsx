/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import api from "../../services/api";
import {
  Globe,
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader2,
  Camera,
} from "lucide-react";

interface Industry {
  id: number;
  industry_name: string;
}

interface Profile {
  company_name: string;
  logo_url: string;
  website: string;
  location: string;
  industry_id: number;
  description: string;
}

const STORAGE_KEY = "employer_company_profile";

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    company_name: "",
    logo_url: "",
    website: "",
    location: "",
    industry_id: 0,
    description: "",
  });
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const initials =
    profile.company_name?.slice(0, 2).toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() ||
    "CO";

  // Load profile from API or localStorage
  const fetchProfile = async () => {
    try {
      const res = await api.get("/employer/profile");
      setProfile((prev) => ({ ...prev, ...res.data }));
      // Also save to localStorage as fallback
      localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
    } catch (err) {
      console.error("Failed to fetch profile", err);
      // Try to load from localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProfile(JSON.parse(stored));
      }
    }
  };

  useEffect(() => {
    Promise.all([fetchProfile(), api.get("/admin/categories")])
      .then(([, i]) => {
        setIndustries(i.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const setField = <K extends keyof Profile>(k: K, v: Profile[K]) =>
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      flash("success", "Company profile updated successfully.");
    } catch {
      flash("error", "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      flash("error", "Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      flash("error", "File too large (max 2MB).");
      return;
    }

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("logo", file);
    try {
      const response = await api.post("/employer/profile/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newLogoUrl = response.data.logoUrl;
      setField("logo_url", newLogoUrl);
      flash("success", "Logo uploaded successfully!");
      // Save updated profile to localStorage
      const updatedProfile = { ...profile, logo_url: newLogoUrl };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
    } catch (error: any) {
      console.error(error);
      flash("error", error.response?.data?.message || "Logo upload failed.");
    } finally {
      setUploadingLogo(false);
      if (logoRef.current) logoRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading company profile...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Company Profile</h2>
          <p className="text-sm text-gray-500">
            Manage your company information
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-xl transition shadow-sm"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <CheckCircle size={14} />
          )}
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {msg && (
        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
            msg.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-600"
          }`}
        >
          {msg.type === "success" ? (
            <CheckCircle size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {msg.text}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Logo Upload */}
          <div className="flex items-center gap-6">
            <div className="relative">
              {profile.logo_url ? (
                <img
                  src={profile.logo_url}
                  alt="Logo"
                  className="w-20 h-20 rounded-2xl object-cover border border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl font-bold">
                  {initials}
                </div>
              )}
              <button
                onClick={() => logoRef.current?.click()}
                disabled={uploadingLogo}
                className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full p-1 shadow-sm hover:bg-purple-700 disabled:opacity-50"
              >
                {uploadingLogo ? (
                  <Loader2 size={12} className="animate-spin text-white" />
                ) : (
                  <Camera size={12} className="text-white" />
                )}
              </button>
              <input
                ref={logoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={uploadLogo}
              />
            </div>
            <div className="text-sm text-gray-500">
              <p>Click the camera icon to upload a company logo.</p>
              <p className="text-xs">JPEG, PNG, max 2MB.</p>
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={profile.company_name}
              onChange={(e) => setField("company_name", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-100"
              placeholder="e.g., Acme Corporation"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <div className="relative">
              <Globe
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="url"
                value={profile.website}
                onChange={(e) => setField("website", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100"
                placeholder="https://yourcompany.com"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <div className="relative">
              <MapPin
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setField("location", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100"
                placeholder="City, Country"
              />
            </div>
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Industry <span className="text-red-500">*</span>
            </label>
            <select
              value={profile.industry_id}
              onChange={(e) =>
                setField("industry_id", parseInt(e.target.value))
              }
              className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-100 bg-white"
            >
              <option value={0}>Select industry</option>
              {industries.map((ind) => (
                <option key={ind.id} value={ind.id}>
                  {ind.industry_name}
                </option>
              ))}
            </select>
          </div>

          {/* Company Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Description
            </label>
            <textarea
              value={profile.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={5}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-100 resize-none"
              placeholder="Tell candidates about your company, culture, and what makes you unique..."
            />
            <p className="text-xs text-gray-400 mt-1">
              {profile.description.length} characters
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
