import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
} from "../../store/notificationsSlice";
import Loader from "../../components/common/Loader";

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const { items, isLoading, unreadCount } = useAppSelector(
    (state) => state.notifications,
  );
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, token]);

  const handleMarkRead = (id: number) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-8">
        Please login to view notifications.
      </div>
    );
  }

  if (isLoading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Mark all as read
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border text-center text-gray-500">
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((notif) => (
            <div
              key={notif.id}
              className={`bg-white p-4 rounded-lg border shadow-sm cursor-pointer hover:bg-gray-50 transition ${
                !notif.is_read ? "border-l-4 border-l-blue-500 bg-blue-50" : ""
              }`}
              onClick={() => handleMarkRead(notif.id)}
            >
              <p className="text-gray-800">{notif.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(notif.created_at).toLocaleString()}
              </p>
              {notif.trigger_type && (
                <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {notif.trigger_type}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
