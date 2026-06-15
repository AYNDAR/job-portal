import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../store";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
} from "../../../store/notificationsSlice";
import { Bell, CheckCheck, Circle } from "lucide-react";

export default function Notifications() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    items: notifications,
    unreadCount,
    isLoading,
  } = useSelector((state: RootState) => state.notifications);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkAsRead = (id: number) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  // Optionally delete notification (if you have an API endpoint)
  // const handleDelete = (id: number) => {
  //   dispatch(deleteNotification(id));
  // };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const displayNotifications = showAll
    ? notifications
    : notifications.slice(0, 5);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header with counts and actions */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
          >
            <CheckCheck size={14} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Bell size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            No notifications
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            When you receive updates, they'll appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {displayNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
                  !notif.is_read ? "border-l-4 border-l-purple-500" : ""
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {!notif.is_read && (
                          <span className="inline-flex items-center">
                            <Circle
                              size={8}
                              className="text-purple-500 fill-purple-500"
                            />
                          </span>
                        )}
                        <p className="text-sm font-medium text-gray-900">
                          {notif.message}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="text-xs text-purple-500 hover:text-purple-700 whitespace-nowrap"
                      >
                        Mark read
                      </button>
                    )}
                    {/* Uncomment if delete endpoint exists */}
                    {/* <button
                      onClick={() => handleDelete(notif.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button> */}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {notifications.length > 5 && (
            <div className="text-center pt-2">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                {showAll
                  ? "Show less"
                  : `Show all ${notifications.length} notifications`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
