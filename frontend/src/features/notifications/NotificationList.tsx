import { Notification } from "../../features/notifications/types";

interface NotificationListProps {
  notifications: Notification[];
  onMarkRead: (id: number) => void;
  onMarkAllRead?: () => void;
  showMarkAll?: boolean;
}

export default function NotificationList({
  notifications,
  onMarkRead,
  onMarkAllRead,
  showMarkAll = true,
}: NotificationListProps) {
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {showMarkAll && unreadCount > 0 && onMarkAllRead && (
        <div className="p-3 border-b flex justify-end">
          <button
            onClick={onMarkAllRead}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Mark all as read
          </button>
        </div>
      )}
      <div className="divide-y divide-gray-200">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No notifications</div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                !notif.is_read ? "bg-blue-50" : ""
              }`}
              onClick={() => onMarkRead(notif.id)}
            >
              <p className="text-gray-800">{notif.message}</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-400">
                  {new Date(notif.created_at).toLocaleString()}
                </span>
                {notif.trigger_type && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {notif.trigger_type}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
