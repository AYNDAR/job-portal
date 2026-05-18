import { useEffect, useState } from "react";
import api from "../../../services/api";

interface Notification {
  id: number;
  message: string;
  user_id: string;
  user_email?: string;
  trigger_type: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllNotifications = async () => {
      try {
        const res = await api.get("/admin/notifications");
        setNotifications(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllNotifications();
  }, []);

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <h2 className="text-xl font-bold p-4 border-b">All Notifications</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Message
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((n) => (
            <tr key={n.id} className="border-b">
              <td className="px-6 py-4 text-sm">{n.user_email || n.user_id}</td>
              <td className="px-6 py-4 text-sm">{n.message}</td>
              <td className="px-6 py-4 text-sm">{n.trigger_type}</td>
              <td className="px-6 py-4 text-sm">
                {new Date(n.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
