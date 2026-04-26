import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
} from "../../store/notificationsSlice";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotificationBell() {
  const dispatch = useAppDispatch();
  const { unreadCount, items } = useAppSelector((state) => state.notifications);
  const { token } = useAppSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (token) {
      dispatch(fetchNotifications());
      const interval = setInterval(() => dispatch(fetchNotifications()), 30000);
      return () => clearInterval(interval);
    }
  }, [dispatch, token]);

  const handleMarkRead = (id: number) => dispatch(markAsRead(id));
  const handleMarkAllRead = () => dispatch(markAllAsRead());

  if (!token) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1 text-gray-700 hover:text-blue-600 focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-20">
            <div className="p-3 border-b flex justify-between items-center">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No notifications
                </div>
              ) : (
                items.slice(0, 10).map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notif.is_read ? "bg-blue-50" : ""}`}
                    onClick={() => handleMarkRead(notif.id)}
                  >
                    <p className="text-sm text-gray-800">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notif.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
            <div className="p-2 border-t text-center">
              <Link
                to="/notifications"
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => setIsOpen(false)}
              >
                View all
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
