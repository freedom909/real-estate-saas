"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { AUDIT_LOGS, AUDIT_LOG_COUNT } from "../../graphql/admin/queries/admin.queries";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminGuard from "../../components/admin/AdminGuard";

const ACTION_TYPES = ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "PROMOTE", "DEMOTE"];
const TARGET_TYPES = ["admin_user", "user", "listing", "booking", "payment", "review", "system_setting", "notification"];

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-green-100 text-green-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  LOGIN: "bg-purple-100 text-purple-700",
  LOGOUT: "bg-gray-100 text-gray-700",
  PROMOTE: "bg-amber-100 text-amber-700",
  DEMOTE: "bg-orange-100 text-orange-700",
};

const ACTION_ICONS: Record<string, string> = {
  CREATE: "➕",
  UPDATE: "✏️",
  DELETE: "🗑️",
  LOGIN: "🔑",
  LOGOUT: "🚪",
  PROMOTE: "⬆️",
  DEMOTE: "⬇️",
};

const DATE_PRESETS = [
  { label: "Today", getRange: () => ({ start: new Date().toISOString().split("T")[0], end: "" }) },
  { label: "Last 7 days", getRange: () => {
    const end = new Date(); const start = new Date(); start.setDate(start.getDate() - 7);
    return { start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] };
  }},
  { label: "Last 30 days", getRange: () => {
    const end = new Date(); const start = new Date(); start.setDate(start.getDate() - 30);
    return { start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] };
  }},
  { label: "Last 90 days", getRange: () => {
    const end = new Date(); const start = new Date(); start.setDate(start.getDate() - 90);
    return { start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] };
  }},
];

export default function AuditLogsPage() {
  return (
    <AdminGuard>
      <AuditLogsContent />
    </AdminGuard>
  );
}

function AuditLogsContent() {
  const [page, setPage] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [viewingLog, setViewingLog] = useState<any>(null);
  const limit = 25;

  const [filters, setFilters] = useState({
    action: "",
    target: "",
    adminId: "",
    startDate: "",
    endDate: "",
  });

  const buildFilter = () => {
    const f: any = {};
    if (filters.action) f.action = filters.action;
    if (filters.target) f.target = filters.target;
    if (filters.adminId) f.adminId = filters.adminId;
    if (filters.startDate) f.startDate = filters.startDate;
    if (filters.endDate) f.endDate = filters.endDate;
    return Object.keys(f).length > 0 ? f : undefined;
  };

  const activeFilter = buildFilter();

  const { data, loading, error, refetch } = useQuery(AUDIT_LOGS, {
    variables: { limit, filter: activeFilter },
  });

  const { data: countData } = useQuery(AUDIT_LOG_COUNT, {
    variables: { filter: activeFilter },
  });

  const logs = data?.adminAuditLogs ?? [];
  const totalCount = countData?.adminAuditLogCount ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  const activitySummary = useMemo(() => {
    const summary: Record<string, number> = {};
    for (const log of logs) {
      const action = log.action?.split("_")[0] || "OTHER";
      summary[action] = (summary[action] || 0) + 1;
    }
    return summary;
  }, [logs]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
    setSelectedPreset(null);
  };

  const handlePreset = (index: number) => {
    const range = DATE_PRESETS[index].getRange();
    setFilters((prev) => ({ ...prev, startDate: range.start, endDate: range.end }));
    setSelectedPreset(index);
    setPage(0);
  };

  const handleApplyFilters = () => {
    setPage(0);
    refetch({ limit, filter: activeFilter });
  };

  const handleClearFilters = () => {
    setFilters({ action: "", target: "", adminId: "", startDate: "", endDate: "" });
    setSelectedPreset(null);
    setPage(0);
    refetch({ limit, filter: undefined });
  };

  const handleExportCSV = () => {
    const headers = ["Action", "Target", "Target ID", "Admin ID", "Details", "IP", "Date"];
    const rows = logs.map((log: any) => [
      log.action, log.target, log.targetId || "", log.adminId,
      log.details || "", log.ip || "", new Date(log.createdAt).toISOString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c: string) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  if (loading && !data) return <AdminLayout><LoadingSkeleton /></AdminLayout>;
  if (error) return <AdminLayout><p className="text-red-500">Error: {error.message}</p></AdminLayout>;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-sm text-gray-500">{totalCount} total entries</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="bg-white border text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
        >
          Export CSV
        </button>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {ACTION_TYPES.map((action) => (
          <div key={action} className="bg-white rounded-xl shadow-sm p-3 text-center">
            <div className="text-lg mb-1">{ACTION_ICONS[action] || "📝"}</div>
            <div className="text-lg font-bold">{activitySummary[action] || 0}</div>
            <div className="text-xs text-gray-500">{action}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Filters</h2>
          {hasActiveFilters && (
            <button onClick={handleClearFilters} className="text-sm text-red-600 hover:text-red-800">
              Clear all
            </button>
          )}
        </div>

        {/* Date Presets */}
        <div className="flex flex-wrap gap-2 mb-4">
          {DATE_PRESETS.map((preset, i) => (
            <button
              key={preset.label}
              onClick={() => handlePreset(i)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                selectedPreset === i
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Action</label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange("action", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Actions</option>
              {ACTION_TYPES.map((a) => (
                <option key={a} value={a}>{ACTION_ICONS[a]} {a}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Target</label>
            <select
              value={filters.target}
              onChange={(e) => handleFilterChange("target", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Targets</option>
              {TARGET_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Admin ID</label>
            <input
              type="text"
              value={filters.adminId}
              onChange={(e) => handleFilterChange("adminId", e.target.value)}
              placeholder="Filter by admin"
              className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleApplyFilters}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            Apply Filters
          </button>
          {hasActiveFilters && (
            <span className="text-sm text-gray-500">
              {Object.values(filters).filter((v) => v !== "").length} filter(s) active
            </span>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3">Action</th>
                <th className="text-left px-6 py-3">Target</th>
                <th className="text-left px-6 py-3">Target ID</th>
                <th className="text-left px-6 py-3">Admin</th>
                <th className="text-left px-6 py-3">Details</th>
                <th className="text-left px-6 py-3">IP</th>
                <th className="text-left px-6 py-3">Date</th>
                <th className="text-left px-6 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any) => {
                const actionBase = log.action?.split("_")[0] || "OTHER";
                return (
                  <tr key={log.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => setViewingLog(log)}>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${ACTION_COLORS[actionBase] || "bg-gray-100 text-gray-700"}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium capitalize">{log.target}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs font-mono max-w-[120px] truncate">{log.targetId || "—"}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs font-mono max-w-[100px] truncate">{log.adminId}</td>
                    <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate">{log.details || "—"}</td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">{log.ip || "—"}</td>
                    <td className="px-6 py-4 text-gray-400 whitespace-nowrap text-xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 hover:text-gray-600">→</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {logs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📋</div>
            <p>{hasActiveFilters ? "No logs match the current filters." : "No audit logs found."}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm"
          >
            Next
          </button>
        </div>
      )}

      {/* Log Detail Modal */}
      {viewingLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setViewingLog(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{ACTION_ICONS[viewingLog.action?.split("_")[0]] || "📝"}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${ACTION_COLORS[viewingLog.action?.split("_")[0]] || "bg-gray-100"}`}>
                  {viewingLog.action}
                </span>
              </div>
              <button onClick={() => setViewingLog(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="space-y-3 mb-6">
              <DetailRow label="Target" value={viewingLog.target} />
              <DetailRow label="Target ID" value={viewingLog.targetId} mono />
              <DetailRow label="Admin ID" value={viewingLog.adminId} mono />
              <DetailRow label="IP Address" value={viewingLog.ip} mono />
              <DetailRow label="Timestamp" value={new Date(viewingLog.createdAt).toLocaleString()} />
              {viewingLog.details && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Details</div>
                  <div className="text-sm bg-gray-50 rounded-lg p-3 font-mono whitespace-pre-wrap break-all">
                    {viewingLog.details}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setViewingLog(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
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

function DetailRow({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-sm ${mono ? "font-mono text-xs" : ""} text-gray-700`}>{value}</span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <AdminLayout>
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-3 text-center">
              <div className="h-6 bg-gray-200 rounded w-12 mx-auto mb-1" />
              <div className="h-3 bg-gray-200 rounded w-16 mx-auto" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex gap-2 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-20" />
            ))}
          </div>
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-t">
              <div className="h-6 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-40" />
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
