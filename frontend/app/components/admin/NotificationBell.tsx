"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { NOTIFICATIONS } from "../../graphql/admin/queries/admin.queries";
import { MARK_NOTIFICATION_READ, MARK_ALL_NOTIFICATIONS_READ, DELETE_NOTIFICATION } from "../../graphql/admin/mutations/admin.mutations";

const TYPE_COLORS: Record<string, string> = {
  INFO: "bg-blue-100 text-blue-700",
  WARNING: "bg-yellow-100 text-yellow-700",
  ERROR: "bg-red-100 text-red-700",
  SUCCESS: "bg-green-100 text-green-700",
};

const TYPE_ICONS: Record<string, string> = {
  INFO: "ℹ️",
  WARNING: "⚠️",
  ERROR: "❌",
  SUCCESS: "✅",
};

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);

  const { data, refetch } = useQuery(NOTIFICATIONS, { variables: { limit: 20 } });
  const [markRead] = useMutation(MARK_NOTIFICATION_READ, { onCompleted: () => refetch() });
  const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ, { onCompleted: () => refetch() });
  const [deleteNotif] = useMutation(DELETE_NOTIFICATION, { onCompleted: () => refetch() });

  const notifications = data?.notifications?.notifications ?? [];
  const unreadCount = data?.notifications?.unreadCount ?? 0;

  const handleMarkRead = async (id: string) => {
    await markRead({ variables: { id } });
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  const handleDelete = async (id: string) => {
    await deleteNotif({ variables: { id } });
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.909C7.67 8.169 5.223 10.141 5 12.49V17h2l1 2h4l1-2h2zm-6 0v2a2 2 0 002 2h4a2 2 0 002-2v-2" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl z-50 max-h-[500px] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto max-h-[400px]">
              {notifications.length === 0 ? (
                <p className="text-center py-8 text-gray-500 text-sm">No notifications</p>
              ) : (
                notifications.map((notif: any) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 border-b hover:bg-gray-50 ${
                      !notif.isRead ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{TYPE_ICONS[notif.type]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${TYPE_COLORS[notif.type]}`}>
                            {notif.type}
                          </span>
                          <span className="font-medium text-sm text-gray-800">{notif.title}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                        <span className="text-xs text-gray-400 mt-1 block">
                          {new Date(notif.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {!notif.isRead && (
                          <button
                            onClick={() => handleMarkRead(notif.id)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Mark read
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notif.id)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t text-center">
              <a
                href="/admin/notifications"
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
