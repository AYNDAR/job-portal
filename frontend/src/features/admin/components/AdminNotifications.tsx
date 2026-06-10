/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import api from "../../../services/api";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";

interface Notification {
  id: number;
  message: string;
  trigger_type: string;
  is_read: boolean;
  created_at: string;
  user?: { email: string };
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/notifications");
      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      // Mock data for demo
      const mockData: Notification[] = [
        {
          id: 1,
          message: "New user registered: john@example.com",
          trigger_type: "User",
          is_read: false,
          created_at: new Date().toISOString(),
          user: { email: "admin@example.com" },
        },
        {
          id: 2,
          message: "Job post created: Senior Developer",
          trigger_type: "Job",
          is_read: true,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          user: { email: "employer@example.com" },
        },
        {
          id: 3,
          message: "Application submitted for Frontend role",
          trigger_type: "Application",
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
      setNotifications(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/admin/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    } catch (error) {
      console.error("Failed to mark as read", error);
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/admin/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Failed to mark all as read", error);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
  };

  const deleteNotification = async (id: number) => {
    if (!confirm("Delete this notification?")) return;
    try {
      await api.delete(`/admin/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Failed to delete", error);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "read") return n.is_read;
    return true;
  });

  if (loading)
    return <div className="p-8 text-center">Loading notifications...</div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-purple-700"
          >
            <CheckCheck size={14} /> Mark all as read
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Bell size={40} className="mx-auto mb-3 text-gray-300" />
            <p>No notifications found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 hover:bg-gray-50 transition flex items-start justify-between gap-3 ${
                  !notif.is_read ? "bg-blue-50/50" : ""
                }`}
              >
                <div className="flex-1">
                  <p
                    className={`text-sm ${!notif.is_read ? "font-semibold text-gray-900" : "text-gray-700"}`}
                  >
                    {notif.message}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                    <span>Type: {notif.trigger_type}</span>
                    <span>{new Date(notif.created_at).toLocaleString()}</span>
                    {notif.user && <span>User: {notif.user.email}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!notif.is_read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      title="Mark as read"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif.id)}
                    title="Delete"
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
