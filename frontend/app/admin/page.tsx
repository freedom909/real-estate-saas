"use client";

import { useQuery } from "@apollo/client/react";
import { DASHBOARD_STATS } from "../graphql/admin/queries/admin.queries";
import AdminLayout from "../components/admin/AdminLayout";
import AdminGuard from "../components/admin/AdminGuard";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"];

function AdminDashboardContent() {
  const { data, loading, error } = useQuery(DASHBOARD_STATS);

  if (loading) return <AdminLayout><p>Loading...</p></AdminLayout>;
  if (error) return <AdminLayout><p className="text-red-500">Error: {error.message}</p></AdminLayout>;

  const stats = data?.dashboardStats;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Users" value={stats?.totalUsers ?? 0} icon="👥" color="blue" />
        <StatCard title="Total Listings" value={stats?.totalListings ?? 0} icon="🏠" color="green" />
        <StatCard title="Total Bookings" value={stats?.totalBookings ?? 0} icon="📅" color="purple" />
        <StatCard title="Active Admins" value={stats?.activeAdmins ?? 0} icon="🛡️" color="amber" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">User Growth (30 days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.userGrowth ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => v.slice(5)}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                name="Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Activity by Action Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Activity by Action</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.activityByAction ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="action" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {(stats?.activityByAction ?? []).map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">System Health</h2>
          <div className="space-y-4">
            <HealthIndicator
              label="Status"
              value={stats?.systemHealth?.status ?? "unknown"}
              healthy={stats?.systemHealth?.status === "healthy"}
            />
            <HealthIndicator
              label="Database"
              value={stats?.systemHealth?.databaseStatus ?? "unknown"}
              healthy={stats?.systemHealth?.databaseStatus === "connected"}
            />
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-500">Uptime</span>
              <span className="text-sm font-medium">{stats?.systemHealth?.uptime ?? "—"}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-500">Last Checked</span>
              <span className="text-sm font-medium">
                {stats?.systemHealth?.lastChecked
                  ? new Date(stats.systemHealth.lastChecked).toLocaleTimeString()
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Action</th>
                  <th className="text-left py-2">Target</th>
                  <th className="text-left py-2">Details</th>
                  <th className="text-left py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentActivity?.map((log: any) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        log.action?.includes("DELETE") ? "bg-red-100 text-red-700" :
                        log.action?.includes("CREATE") ? "bg-green-100 text-green-700" :
                        log.action?.includes("UPDATE") ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2">{log.target}</td>
                    <td className="py-2 text-gray-500 max-w-xs truncate">{log.details || "—"}</td>
                    <td className="py-2 text-gray-400">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className="text-3xl font-bold mt-1">{value.toLocaleString()}</div>
        </div>
        <div className={`text-3xl p-3 rounded-xl ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function HealthIndicator({ label, value, healthy }: { label: string; value: string; healthy: boolean }) {
  return (
    <div className="flex justify-between items-center py-2 border-b">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`flex items-center gap-2 text-sm font-medium ${
        healthy ? "text-green-600" : "text-red-600"
      }`}>
        <span className={`w-2 h-2 rounded-full ${healthy ? "bg-green-500" : "bg-red-500"}`} />
        {value}
      </span>
    </div>
  );
}
