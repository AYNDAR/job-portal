import { useState, useEffect } from "react";
import {
  Save,
  Globe,
  Mail,
  Database,
  History,
  Wrench,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Download,
  Trash2,
} from "lucide-react";

type Tab = "general" | "email" | "backup" | "logs" | "maintenance";

const STORAGE_KEY = "superadmin_system_settings";

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      setGeneral(data.general);
      setEmailConfig(data.emailConfig);
      setMaintenanceMode(data.maintenanceMode);
    }
  }, []);

  // General Settings
  const [general, setGeneral] = useState({
    siteName: "JobPortal",
    contactEmail: "admin@jobportal.com",
    defaultCurrency: "ETB",
    timezone: "Africa/Addis_Ababa",
    itemsPerPage: 10,
    enableRegistration: true,
    platformName: "JobPortal",
    platformLogo: "",
  });

  // Email Settings
  const [emailConfig, setEmailConfig] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUser: "",
    smtpPass: "",
    fromEmail: "noreply@jobportal.com",
    fromName: "JobPortal",
  });
  const [testEmail, setTestEmail] = useState("");
  const [testLoading, setTestLoading] = useState(false);

  // Backup & Logs (mock only – not persisted in localStorage because they are dynamic)
  const [backups, setBackups] = useState([
    {
      id: 1,
      filename: "backup_2025_06_01.sql",
      size: "45 MB",
      date: "2025-06-01 02:00",
    },
    {
      id: 2,
      filename: "backup_2025_05_25.sql",
      size: "43 MB",
      date: "2025-05-25 02:00",
    },
  ]);
  const [auditLogs] = useState([
    {
      id: 1,
      user: "admin@example.com",
      action: "Changed system settings",
      timestamp: "2025-06-07 14:32:21",
    },
    {
      id: 2,
      user: "superadmin@example.com",
      action: "Created new admin account",
      timestamp: "2025-06-07 10:15:03",
    },
    {
      id: 3,
      user: "employer@example.com",
      action: "Login failed (invalid password)",
      timestamp: "2025-06-06 09:45:12",
    },
  ]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);

  const handleSave = (section: string) => {
    setLoading(true);
    setTimeout(() => {
      // Save all settings to localStorage
      const allSettings = {
        general,
        emailConfig,
        maintenanceMode,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings));
      setSaveMessage(`${section} settings saved successfully!`);
      setTimeout(() => setSaveMessage(""), 3000);
      setLoading(false);
    }, 800);
  };

  const handleCreateBackup = () => {
    setBackupLoading(true);
    setTimeout(() => {
      const newBackup = {
        id: backups.length + 1,
        filename: `backup_${new Date().toISOString().slice(0, 10)}.sql`,
        size: "46 MB",
        date: new Date().toLocaleString(),
      };
      setBackups([newBackup, ...backups]);
      setBackupLoading(false);
      setSaveMessage("Backup created successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    }, 1500);
  };

  const handleTestEmail = () => {
    if (!testEmail) {
      alert("Enter a test email address");
      return;
    }
    setTestLoading(true);
    setTimeout(() => {
      setTestLoading(false);
      alert(`Test email sent to ${testEmail}`);
    }, 1000);
  };

  const tabs = [
    { id: "general", label: "General", icon: <Globe size={16} /> },
    { id: "email", label: "Email", icon: <Mail size={16} /> },
    { id: "backup", label: "Backup", icon: <Database size={16} /> },
    { id: "logs", label: "Audit Logs", icon: <History size={16} /> },
    { id: "maintenance", label: "Maintenance", icon: <Wrench size={16} /> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">
          System Configuration
        </h2>
        {saveMessage && (
          <div className="flex items-center gap-1 text-green-600 text-sm bg-green-50 px-3 py-1 rounded-full">
            <CheckCircle size={14} /> {saveMessage}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition ${
              activeTab === tab.id
                ? "bg-white text-purple-600 border-b-2 border-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Platform Name</label>
              <input
                type="text"
                value={general.platformName}
                onChange={(e) =>
                  setGeneral({ ...general, platformName: e.target.value })
                }
                className="mt-1 w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Site Name</label>
              <input
                type="text"
                value={general.siteName}
                onChange={(e) =>
                  setGeneral({ ...general, siteName: e.target.value })
                }
                className="mt-1 w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Logo URL</label>
              <input
                type="url"
                value={general.platformLogo}
                onChange={(e) =>
                  setGeneral({ ...general, platformLogo: e.target.value })
                }
                placeholder="https://example.com/logo.png"
                className="mt-1 w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Contact Email</label>
              <input
                type="email"
                value={general.contactEmail}
                onChange={(e) =>
                  setGeneral({ ...general, contactEmail: e.target.value })
                }
                className="mt-1 w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Default Currency
              </label>
              <select
                value={general.defaultCurrency}
                onChange={(e) =>
                  setGeneral({ ...general, defaultCurrency: e.target.value })
                }
                className="mt-1 w-full border rounded-lg px-3 py-2"
              >
                <option>ETB</option>
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Timezone</label>
              <select
                value={general.timezone}
                onChange={(e) =>
                  setGeneral({ ...general, timezone: e.target.value })
                }
                className="mt-1 w-full border rounded-lg px-3 py-2"
              >
                <option>Africa/Addis_Ababa</option>
                <option>Africa/Nairobi</option>
                <option>Africa/Lagos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">
                Items Per Page (default)
              </label>
              <input
                type="number"
                value={general.itemsPerPage}
                onChange={(e) =>
                  setGeneral({
                    ...general,
                    itemsPerPage: parseInt(e.target.value),
                  })
                }
                className="mt-1 w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Allow New Registrations</p>
                <p className="text-xs text-gray-500">
                  Enable/disable user registration
                </p>
              </div>
              <button
                onClick={() =>
                  setGeneral({
                    ...general,
                    enableRegistration: !general.enableRegistration,
                  })
                }
                className={`relative w-10 h-5 rounded-full transition-colors ${general.enableRegistration ? "bg-purple-600" : "bg-gray-300"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${general.enableRegistration ? "translate-x-5" : ""}`}
                />
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => handleSave("General")}
              disabled={loading}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}{" "}
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Email Settings */}
      {activeTab === "email" && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">SMTP Host</label>
              <input
                type="text"
                value={emailConfig.smtpHost}
                onChange={(e) =>
                  setEmailConfig({ ...emailConfig, smtpHost: e.target.value })
                }
                className="mt-1 w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">SMTP Port</label>
              <input
                type="number"
                value={emailConfig.smtpPort}
                onChange={(e) =>
                  setEmailConfig({
                    ...emailConfig,
                    smtpPort: parseInt(e.target.value),
                  })
                }
                className="mt-1 w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Username</label>
              <input
                type="text"
                value={emailConfig.smtpUser}
                onChange={(e) =>
                  setEmailConfig({ ...emailConfig, smtpUser: e.target.value })
                }
                className="mt-1 w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password"
                value={emailConfig.smtpPass}
                onChange={(e) =>
                  setEmailConfig({ ...emailConfig, smtpPass: e.target.value })
                }
                className="mt-1 w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">From Email</label>
              <input
                type="email"
                value={emailConfig.fromEmail}
                onChange={(e) =>
                  setEmailConfig({ ...emailConfig, fromEmail: e.target.value })
                }
                className="mt-1 w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">From Name</label>
              <input
                type="text"
                value={emailConfig.fromName}
                onChange={(e) =>
                  setEmailConfig({ ...emailConfig, fromName: e.target.value })
                }
                className="mt-1 w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <div className="border-t pt-4">
            <label className="block text-sm font-medium">
              Test Email Address
            </label>
            <div className="flex gap-2 mt-1">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="admin@example.com"
                className="flex-1 border rounded-lg px-3 py-2"
              />
              <button
                onClick={handleTestEmail}
                disabled={testLoading}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-1"
              >
                {testLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Mail size={14} />
                )}{" "}
                Send Test
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => handleSave("Email")}
              disabled={loading}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}{" "}
              Save SMTP Settings
            </button>
          </div>
        </div>
      )}

      {/* Backup & Restore */}
      {activeTab === "backup" && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Database Backups</h3>
            <button
              onClick={handleCreateBackup}
              disabled={backupLoading}
              className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700"
            >
              {backupLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Database size={14} />
              )}{" "}
              Create Backup
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium">
                    Filename
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium">
                    Size
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {backups.map((b) => (
                  <tr key={b.id} className="border-b">
                    <td className="px-4 py-2 text-sm">{b.filename}</td>
                    <td className="px-4 py-2 text-sm">{b.size}</td>
                    <td className="px-4 py-2 text-sm">{b.date}</td>
                    <td className="px-4 py-2 text-sm">
                      <button className="text-blue-600 hover:text-blue-800 mr-2">
                        <Download size={14} />
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Logs */}
      {activeTab === "logs" && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Recent System Activities</h3>
            <button className="text-purple-600 text-sm hover:underline">
              Export Logs
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium">
                    User
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium">
                    Action
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-b">
                    <td className="px-4 py-2 text-sm">{log.user}</td>
                    <td className="px-4 py-2 text-sm">{log.action}</td>
                    <td className="px-4 py-2 text-sm">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Maintenance */}
      {activeTab === "maintenance" && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div>
              <p className="font-semibold">Maintenance Mode</p>
              <p className="text-sm text-gray-600">
                When enabled, only admins can access the site.
              </p>
            </div>
            <button
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`relative w-10 h-5 rounded-full transition-colors ${maintenanceMode ? "bg-red-600" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${maintenanceMode ? "translate-x-5" : ""}`}
              />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
              <RefreshCw size={16} /> Clear Cache
            </button>
            <button className="flex items-center justify-center gap-2 border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
              <AlertTriangle size={16} /> Restart Services
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
