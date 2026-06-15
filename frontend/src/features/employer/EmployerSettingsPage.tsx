/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Save,
  Lock,
  Bell,
  Eye,
  EyeOff,
  CheckCircle,
  Loader2,
  Mail,
} from "lucide-react";
import api from "../../services/api";

interface NotificationPrefs {
  emailAlerts: boolean;
  inAppNotifications: boolean;
  jobRecommendations: boolean;
  marketingEmails: boolean;
}

export default function EmployerSettingsPage() {
  // Email change
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Notification preferences
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    emailAlerts: true,
    inAppNotifications: true,
    jobRecommendations: true,
    marketingEmails: false,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load current email from user data
  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    if (user?.email) setCurrentEmail(user.email);
  }, []);

  // Load notification preferences from localStorage / backend
  useEffect(() => {
    const stored = localStorage.getItem("employer_notification_prefs");
    if (stored) {
      try {
        setPrefs(JSON.parse(stored));
      } catch (err) {
        console.warn("Failed to parse stored notification preferences", err);
      }
    }
    api
      .get("/employer/notification-preferences")
      .then((res) => {
        if (res.data) setPrefs(res.data);
      })
      .catch((err) => {
        console.warn("Failed to load notification preferences", err);
      });
  }, []);

  const saveAllSettings = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    const updates = [];

    // 1. Email change (if different)
    if (newEmail && newEmail !== currentEmail) {
      if (!/^\S+@\S+\.\S+$/.test(newEmail)) {
        setError("Invalid email address");
        setLoading(false);
        return;
      }
      updates.push(
        api.put("/employer/account/email", { email: newEmail }).then(() => {
          // Update localStorage
          const userRaw = localStorage.getItem("user");
          const user = userRaw ? JSON.parse(userRaw) : null;
          if (user) {
            user.email = newEmail;
            localStorage.setItem("user", JSON.stringify(user));
          }
          setCurrentEmail(newEmail);
          setNewEmail("");
        }),
      );
    }

    // 2. Password change (if any password field filled)
    const shouldChangePassword =
      currentPassword || newPassword || confirmPassword;
    if (shouldChangePassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setError("All password fields are required to change password");
        setLoading(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("New passwords do not match");
        setLoading(false);
        return;
      }
      if (newPassword.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }
      updates.push(
        api
          .post("/employer/change-password", { currentPassword, newPassword })
          .then(() => {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
          }),
      );
    }

    // 3. Notification preferences (always save)
    updates.push(
      api
        .put("/employer/notification-preferences", prefs)
        .catch(() => {
          /* ignore */
        })
        .then(() => {
          localStorage.setItem(
            "employer_notification_prefs",
            JSON.stringify(prefs),
          );
        }),
    );

    try {
      await Promise.all(updates);
      setMessage("All settings saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to save some settings";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Settings</h2>

      {/* Email Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-md font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
          <Mail size={16} /> Change Email Address
        </h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Email
            </label>
            <input
              type="email"
              value={currentEmail}
              disabled
              className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Email
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter new email address"
              className="w-full border border-gray-200 rounded-lg px-4 py-2"
            />
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-md font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
          <Lock size={16} /> Change Password
        </h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-md font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
          <Bell size={16} /> Notification Preferences
        </h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">Email Alerts</p>
              <p className="text-xs text-gray-500">
                Receive email notifications for important updates
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setPrefs({ ...prefs, emailAlerts: !prefs.emailAlerts })
              }
              className={`relative w-10 h-5 rounded-full transition-colors ${prefs.emailAlerts ? "bg-purple-600" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${prefs.emailAlerts ? "translate-x-5" : ""}`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">
                In-app Notifications
              </p>
              <p className="text-xs text-gray-500">
                Show notifications inside the dashboard
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setPrefs({
                  ...prefs,
                  inAppNotifications: !prefs.inAppNotifications,
                })
              }
              className={`relative w-10 h-5 rounded-full transition-colors ${prefs.inAppNotifications ? "bg-purple-600" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${prefs.inAppNotifications ? "translate-x-5" : ""}`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">
                Job Recommendations
              </p>
              <p className="text-xs text-gray-500">
                Get personalized job recommendations
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setPrefs({
                  ...prefs,
                  jobRecommendations: !prefs.jobRecommendations,
                })
              }
              className={`relative w-10 h-5 rounded-full transition-colors ${prefs.jobRecommendations ? "bg-purple-600" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${prefs.jobRecommendations ? "translate-x-5" : ""}`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">
                Marketing Emails
              </p>
              <p className="text-xs text-gray-500">
                Receive tips, news, and promotions
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setPrefs({ ...prefs, marketingEmails: !prefs.marketingEmails })
              }
              className={`relative w-10 h-5 rounded-full transition-colors ${prefs.marketingEmails ? "bg-purple-600" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${prefs.marketingEmails ? "translate-x-5" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Single Save Button */}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {message && (
        <div className="text-green-600 text-sm flex items-center gap-1">
          <CheckCircle size={14} /> {message}
        </div>
      )}
      <div className="flex justify-end">
        <button
          onClick={saveAllSettings}
          disabled={loading}
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Save All Changes
        </button>
      </div>
    </div>
  );
}
