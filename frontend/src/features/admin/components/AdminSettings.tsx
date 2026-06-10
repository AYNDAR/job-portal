import { useState, useEffect, useRef } from "react";
import { Save, Camera, Mail, Loader2, CheckCircle } from "lucide-react";
import api from "../../../services/api";

const AVATAR_STORAGE_KEY = "admin_avatar";

export default function AdminSettings() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Load profile data (including avatar from localStorage)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/admin/profile");
        setFullName(res.data.fullName || "");
        setEmail(res.data.email || "");
        const storedAvatar = localStorage.getItem(AVATAR_STORAGE_KEY);
        if (storedAvatar) {
          setAvatarUrl(storedAvatar);
        } else if (res.data.avatarUrl) {
          setAvatarUrl(res.data.avatarUrl);
        }
      } catch (error) {
        console.error("Failed to load profile", error);
        const storedName = localStorage.getItem("admin_fullname");
        if (storedName) setFullName(storedName);
        const storedEmail =
          localStorage.getItem("admin_email") || "admin@example.com";
        setEmail(storedEmail);
        const storedAvatar = localStorage.getItem(AVATAR_STORAGE_KEY);
        if (storedAvatar) setAvatarUrl(storedAvatar);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      setError("Full name is required");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await api.put("/admin/profile", { fullName });
      localStorage.setItem("admin_fullname", fullName);
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      localStorage.setItem("admin_fullname", fullName);
      setMessage("Profile saved locally (API not available)");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB");
      return;
    }
    setUploading(true);
    setError("");
    setMessage("");

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setAvatarUrl(base64);
      localStorage.setItem(AVATAR_STORAGE_KEY, base64);
      // Notify other components (like the navbar) that avatar changed
      window.dispatchEvent(new Event("storage"));
      setMessage("Avatar updated successfully!");
      setTimeout(() => setMessage(""), 3000);
      setUploading(false);
    };
    reader.onerror = () => {
      setError("Failed to read image");
      setUploading(false);
    };
    reader.readAsDataURL(file);

    // Optional: also try to send to backend (if endpoint exists)
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      await api.post("/admin/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Backend avatar update successful");
    } catch (err) {
      console.warn("Backend avatar upload failed, but saved locally");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setPasswordLoading(true);
    setError("");
    setMessage("");
    try {
      await api.post("/admin/change-password", {
        currentPassword,
        newPassword,
      });
      setMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setMessage(""), 3000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to change password";
      setError(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const initials = fullName
    ? fullName.charAt(0).toUpperCase()
    : email.charAt(0).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Account Settings</h2>

      {/* Profile Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <h3 className="text-md font-semibold text-gray-800 border-b pb-2">
          Profile Information
        </h3>

        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-2xl font-bold">
                {initials}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-1 shadow-sm hover:bg-purple-700 disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 size={14} className="animate-spin text-white" />
              ) : (
                <Camera size={14} className="text-white" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <div className="text-sm text-gray-500">
            <p>Click the camera icon to upload a profile picture.</p>
            <p className="text-xs">
              JPEG, PNG, max 2MB. Image is saved locally.
            </p>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-100"
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 items-center gap-1">
            <Mail size={14} /> Email Address
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">
            Email cannot be changed. Contact Super Admin for email updates.
          </p>
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        {message && (
          <div className="text-green-600 text-sm flex items-center gap-1">
            <CheckCircle size={14} /> {message}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSaveProfile}
            disabled={loading}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>

      {/* Password Change Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <h3 className="text-md font-semibold text-gray-800 border-b pb-2">
          Change Password
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-gray-200 rounded-lg px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={passwordLoading}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              {passwordLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
