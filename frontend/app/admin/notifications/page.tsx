"use client";

import { useState, useMemo } from "react";
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

type FilterTab = "all" | "unread";
type TypeFilter = "" | "INFO" | "WARNING" | "ERROR" | "SUCCESS";

function groupByDate(notifications: any[]): Record<string, any[]> {
  const groups: Record<string, any[]> = {};
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.setDate(now.getDate() - 1)).toDateString();

  for (const n of notifications) {
    const date = new Date(n.createdAt).toDateString();
    let label: string;
    if (date === today) label = "Today";
    else if (date === yesterday) label = "Yesterday";
    else label = new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  }
  return groups;
}

export default function NotificationsPage() {
  return (
    <AdminGuard>
      <NotificationsContent />
    </AdminGuard>
  );
}

function NotificationsContent() {
  const { data, loading, error, refetch } = useQuery(NOTIFICATIONS, { variables: { limit: 200 } });
  const [markRead] = useMutation(MARK_NOTIFICATION_READ, { onCompleted: () => refetch() });
  const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ, { onCompleted: () => refetch() });
  const [deleteNotif] = useMutation(DELETE_NOTIFICATION, { onCompleted: () => refetch() });

  const [tab, setTab] = useState<FilterTab>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewingNotif, setViewingNotif] = useState<any>(null);

  const notifications = data?.notifications?.notifications ?? [];
  const unreadCount = data?.notifications?.unreadCount ?? 0;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n: any) => {
      const matchesTab = tab === "all" || !n.isRead;
      const matchesType = !typeFilter || n.type === typeFilter;
      return matchesTab && matchesType;
    });
  }, [notifications, tab, typeFilter]);

  const grouped = useMemo(() => groupByDate(filteredNotifications), [filteredNotifications]);
  const groupLabels = Object.keys(grouped);

  const allVisibleSelected = filteredNotifications.length > 0 && filteredNotifications.every((n: any) => selectedIds.has(n.id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredNotifications.map((n: any) => n.id)));
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleMarkSelectedRead = async () => {
    for (const id of selectedIds) {
      await markRead({ variables: { id } });
    }
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Delete ${selectedIds.size} notifications?`)) return;
    for (const id of selectedIds) {
      await deleteNotif({ variables: { id } });
    }
    setSelectedIds(new Set());
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this notification?")) {
      await deleteNotif({ variables: { id } });
    }
  };

  if (loading) return <AdminLayout><LoadingSkeleton /></AdminLayout>;
  if (error) return <AdminLayout><p className="text-red-500">Error: {error.message}</p></AdminLayout>;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-gray-500">{unreadCount} unread of {notifications.length} total</p>
        </div>
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <>
              <button
                onClick={handleMarkSelectedRead}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
              >
                Mark read ({selectedIds.size})
              </button>
              <button
                onClick={handleDeleteSelected}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
              >
                Delete ({selectedIds.size})
              </button>
            </>
          )}
          {unreadCount > 0 && selectedIds.size === 0 && (
            <button
              onClick={() => markAllRead()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setTab("all")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              tab === "all" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setTab("unread")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              tab === "unread" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
        <div className="h-6 w-px bg-gray-300" />
        <div className="flex gap-1">
          <button
            onClick={() => setTypeFilter("")}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              typeFilter === "" ? "bg-gray-800 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            All Types
          </button>
          {Object.entries(TYPE_ICONS).map(([type, icon]) => (
            <button
              key={type}
              onClick={() => setTypeFilter(typeFilter === type ? "" : type as TypeFilter)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                typeFilter === type ? "bg-gray-800 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"
              }`}
            >
              {icon} {type}
            </button>
          ))}
        </div>
      </div>

      {/* Select All */}
      {filteredNotifications.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={allVisibleSelected}
            onChange={toggleSelectAll}
            className="rounded"
          />
          <span className="text-sm text-gray-500">
            {selectedIds.size > 0 ? `${selectedIds.size} selected` : "Select all"}
          </span>
        </div>
      )}

      {/* Notifications by Date Group */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
          <div className="text-4xl mb-4">🔔</div>
          <p>{tab === "unread" ? "No unread notifications." : "No notifications."}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupLabels.map((label) => (
            <div key={label}>
              <h3 className="text-sm font-medium text-gray-500 mb-3">{label}</h3>
              <div className="space-y-2">
                {grouped[label].map((notif: any) => (
                  <div
                    key={notif.id}
                    className={`bg-white rounded-xl shadow-sm p-4 flex items-start gap-4 transition-colors cursor-pointer hover:bg-gray-50 ${
                      !notif.isRead ? "border-l-4 border-blue-500" : ""
                    } ${selectedIds.has(notif.id) ? "ring-2 ring-blue-200" : ""}`}
                    onClick={() => setViewingNotif(notif)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(notif.id)}
                      onChange={(e) => { e.stopPropagation(); toggleSelect(notif.id); }}
                      className="mt-1 rounded"
                    />
                    <span className="text-2xl">{TYPE_ICONS[notif.type]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[notif.type]}`}>
                          {notif.type}
                        </span>
                        <h3 className="font-semibold text-gray-800 truncate">{notif.title}</h3>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{notif.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>{new Date(notif.createdAt).toLocaleTimeString()}</span>
                        {notif.target && <span className="capitalize">{notif.target}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {!notif.isRead && (
                        <button
                          onClick={() => markRead({ variables: { id: notif.id } })}
                          className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Notification Modal */}
      {viewingNotif && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setViewingNotif(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{TYPE_ICONS[viewingNotif.type]}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[viewingNotif.type]}`}>
                  {viewingNotif.type}
                </span>
              </div>
              <button onClick={() => setViewingNotif(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <h2 className="text-xl font-bold mb-3">{viewingNotif.title}</h2>
            <p className="text-gray-600 mb-4 whitespace-pre-wrap">{viewingNotif.message}</p>
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
              <span>{new Date(viewingNotif.createdAt).toLocaleString()}</span>
              {viewingNotif.target && (
                <span className="capitalize px-2 py-0.5 bg-gray-100 rounded">{viewingNotif.target}</span>
              )}
              {viewingNotif.targetId && (
                <span className="font-mono text-xs">{viewingNotif.targetId}</span>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              {!viewingNotif.isRead && (
                <button
                  onClick={() => { markRead({ variables: { id: viewingNotif.id } }); setViewingNotif(null); }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Mark as read
                </button>
              )}
              <button
                onClick={() => { handleDelete(viewingNotif.id); setViewingNotif(null); }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setViewingNotif(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function LoadingSkeleton() {
  return (
    <AdminLayout>
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
        <div className="flex gap-2 mb-6">
          <div className="h-10 bg-gray-200 rounded w-20" />
          <div className="h-10 bg-gray-200 rounded w-20" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 flex items-start gap-4">
              <div className="h-4 bg-gray-200 rounded w-4 mt-1" />
              <div className="h-8 w-8 bg-gray-200 rounded" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-full mb-1" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
