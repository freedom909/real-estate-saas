"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { NOTIFICATIONS } from "../../graphql/admin/queries/admin.queries";
import { MARK_NOTIFICATION_READ, MARK_ALL_NOTIFICATIONS_READ, DELETE_NOTIFICATION } from "../../graphql/admin/mutations/admin.mutations";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminGuard from "../../components/admin/AdminGuard";

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

export default function NotificationsPage() {
  return (
    <AdminGuard>
      <NotificationsContent />
    </AdminGuard>
  );
}

function NotificationsContent() {
  const { data, loading, error, refetch } = useQuery(NOTIFICATIONS, { variables: { limit: 100 } });
  const [markRead] = useMutation(MARK_NOTIFICATION_READ, { onCompleted: () => refetch() });
  const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ, { onCompleted: () => refetch() });
  const [deleteNotif] = useMutation(DELETE_NOTIFICATION, { onCompleted: () => refetch() });

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const notifications = data?.notifications?.notifications ?? [];
  const unreadCount = data?.notifications?.unreadCount ?? 0;

  const filteredNotifications = filter === "unread"
    ? notifications.filter((n: any) => !n.isRead)
    : notifications;

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this notification?")) {
      await deleteNotif({ variables: { id } });
    }
  };

  if (loading) return <AdminLayout><p>Loading...</p></AdminLayout>;
  if (error) return <AdminLayout><p className="text-red-500">Error: {error.message}</p></AdminLayout>;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-gray-500">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm ${
            filter === "all" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-lg text-sm ${
            filter === "unread" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
            {filter === "unread" ? "No unread notifications." : "No notifications."}
          </div>
        ) : (
          filteredNotifications.map((notif: any) => (
            <div
              key={notif.id}
              className={`bg-white rounded-xl shadow-sm p-4 flex items-start gap-4 ${
                !notif.isRead ? "border-l-4 border-blue-500" : ""
              }`}
            >
              <span className="text-2xl">{TYPE_ICONS[notif.type]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[notif.type]}`}>
                    {notif.type}
                  </span>
                  <h3 className="font-semibold text-gray-800">{notif.title}</h3>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600">{notif.message}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span>{new Date(notif.createdAt).toLocaleString()}</span>
                  {notif.target && <span>Target: {notif.target}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {!notif.isRead && (
                  <button
                    onClick={() => markRead({ variables: { id: notif.id } })}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Mark read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notif.id)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
