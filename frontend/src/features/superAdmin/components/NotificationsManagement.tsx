import { useState, useEffect } from "react";
import { Send, Trash2, Users, Briefcase, User } from "lucide-react";

interface NotificationLog {
  id: number;
  title: string;
  message: string;
  target: "all" | "employers" | "jobseekers";
  sentAt: string;
  sentBy: string;
}

const STORAGE_KEY = "superadmin_notification_logs";

export default function NotificationsManagement() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<"all" | "employers" | "jobseekers">(
    "all",
  );
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState<NotificationLog[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setLogs(JSON.parse(stored));
    } else {
      // Default demo logs
      const defaultLogs: NotificationLog[] = [
        {
          id: 1,
          title: "Maintenance",
          message: "System will be down at 2 AM",
          target: "all",
          sentAt: "2025-06-07 10:00",
          sentBy: "superadmin@example.com",
        },
        {
          id: 2,
          title: "New Feature",
          message: "Resume builder is live",
          target: "jobseekers",
          sentAt: "2025-06-06 15:30",
          sentBy: "admin@example.com",
        },
      ];
      setLogs(defaultLogs);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultLogs));
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setLogs(JSON.parse(stored) as NotificationLog[]);
    }
  }, []);

  useEffect(() => {
    if (logs.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    }
  }, [logs]);

  const handleSend = () => {
    if (!title || !message) {
      alert("Title and message are required");
      return;
    }
    setSending(true);
    setTimeout(() => {
      const newLog: NotificationLog = {
        id: Date.now(),
        title,
        message,
        target,
        sentAt: new Date().toLocaleString(),
        sentBy: "superadmin@example.com",
      };
      setLogs([newLog, ...logs]);
      setTitle("");
      setMessage("");
      setSending(false);
      alert(`Notification sent to ${target === "all" ? "all users" : target}`);
    }, 800);
  };

  const deleteLog = (id: number) => {
    if (confirm("Delete this notification log?")) {
      setLogs(logs.filter((l) => l.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Send Notification</h2>
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-2"
            placeholder="e.g., Maintenance Announcement"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Message</label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-2"
            placeholder="Write the notification content..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Send to</label>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="all"
                checked={target === "all"}
                onChange={() => setTarget("all")}
              />{" "}
              <Users size={14} /> All Users
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="employers"
                checked={target === "employers"}
                onChange={() => setTarget("employers")}
              />{" "}
              <Briefcase size={14} /> Employers
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="jobseekers"
                checked={target === "jobseekers"}
                onChange={() => setTarget("jobseekers")}
              />{" "}
              <User size={14} /> Job Seekers
            </label>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSend}
            disabled={sending}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            {sending ? (
              "Sending..."
            ) : (
              <>
                <Send size={16} /> Send Notification
              </>
            )}
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mt-8">
        Notification Logs
      </h2>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Target
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Sent At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {log.title}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {log.message}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {log.target === "all"
                    ? "All"
                    : log.target === "employers"
                      ? "Employers"
                      : "Job Seekers"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {log.sentAt}
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => deleteLog(log.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
