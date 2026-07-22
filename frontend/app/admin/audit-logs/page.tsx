"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { AUDIT_LOGS, AUDIT_LOG_COUNT } from "../../graphql/admin/queries/admin.queries";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminGuard from "../../components/admin/AdminGuard";

export default function AuditLogsPage() {
  return (
    <AdminGuard>
      <AuditLogsContent />
    </AdminGuard>
  );
}

function AuditLogsContent() {
  const [page, setPage] = useState(0);
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

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleApplyFilters = () => {
    setPage(0);
    refetch({ limit, filter: activeFilter });
  };

  const handleClearFilters = () => {
    setFilters({ action: "", target: "", adminId: "", startDate: "", endDate: "" });
    setPage(0);
    refetch({ limit, filter: undefined });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  if (loading && !data) return <AdminLayout><p>Loading...</p></AdminLayout>;
  if (error) return <AdminLayout><p className="text-red-500">Error: {error.message}</p></AdminLayout>;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-sm text-gray-500">{totalCount} total entries</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Filters</h2>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Action</label>
            <input
              type="text"
              value={filters.action}
              onChange={(e) => handleFilterChange("action", e.target.value)}
              placeholder="e.g. CREATE, DELETE"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Target</label>
            <input
              type="text"
              value={filters.target}
              onChange={(e) => handleFilterChange("target", e.target.value)}
              placeholder="e.g. user, listing"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Admin ID</label>
            <input
              type="text"
              value={filters.adminId}
              onChange={(e) => handleFilterChange("adminId", e.target.value)}
              placeholder="Filter by admin"
              className="w-full border rounded-lg px-3 py-2 text-sm"
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

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleApplyFilters}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            Apply Filters
          </button>
          {hasActiveFilters && (
            <span className="flex items-center text-sm text-gray-500">
              {Object.values(filters).filter((v) => v !== "").length} filter(s) active
            </span>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3">Action</th>
              <th className="text-left px-6 py-3">Target</th>
              <th className="text-left px-6 py-3">Target ID</th>
              <th className="text-left px-6 py-3">Admin ID</th>
              <th className="text-left px-6 py-3">Details</th>
              <th className="text-left px-6 py-3">IP</th>
              <th className="text-left px-6 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log: any) => (
              <tr key={log.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    log.action?.includes("DELETE") ? "bg-red-100 text-red-700" :
                    log.action?.includes("CREATE") ? "bg-green-100 text-green-700" :
                    log.action?.includes("UPDATE") ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium">{log.target}</td>
                <td className="px-6 py-4 text-gray-500 text-xs font-mono">{log.targetId || "—"}</td>
                <td className="px-6 py-4 text-gray-500 text-xs font-mono">{log.adminId}</td>
                <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{log.details || "—"}</td>
                <td className="px-6 py-4 text-gray-400 font-mono text-xs">{log.ip || "—"}</td>
                <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <p className="text-center py-8 text-gray-500">
            {hasActiveFilters ? "No logs match the current filters." : "No audit logs found."}
          </p>
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
    </AdminLayout>
  );
}
