import { useEffect, useState } from "react";
import api from "../../../services/api";

interface Notification {
  id: number;
  user: { email: string } | null;
  message: string;
  trigger_type: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsManagement() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await api.get("/admin/notifications/all");
        setNotifications(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm">
      <h2 className="text-xl font-bold mb-4">All Notifications</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th>User</th>
              <th>Message</th>
              <th>Type</th>
              <th>Read</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((n) => (
              <tr key={n.id} className="border-b">
                <td className="py-2">{n.user?.email || "Unknown"}</td>
                <td>{n.message}</td>
                <td>{n.trigger_type}</td>
                <td>{n.is_read ? "Yes" : "No"}</td>
                <td>{new Date(n.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
