"use client";

import { useQuery } from "@apollo/client/react";
import { DASHBOARD_STATS } from "../graphql/admin/queries/admin.queries";
import AdminLayout from "../components/admin/AdminLayout";
import AdminGuard from "../components/admin/AdminGuard";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"];

const QUICK_ACTIONS = [
  { href: "/admin/analytics", label: "Analytics", icon: "📈", color: "bg-emerald-50 text-emerald-600" },
  { href: "/admin/users", label: "Admin Users", icon: "🛡️", color: "bg-blue-50 text-blue-600" },
  { href: "/admin/manage-users", label: "Manage Users", icon: "👥", color: "bg-purple-50 text-purple-600" },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: "📋", color: "bg-amber-50 text-amber-600" },
  { href: "/admin/notifications", label: "Notifications", icon: "🔔", color: "bg-rose-50 text-rose-600" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️", color: "bg-gray-50 text-gray-600" },
];

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}

function AdminDashboardContent() {
  const { data, loading, error } = useQuery(DASHBOARD_STATS);

  if (loading) return <AdminLayout><LoadingSkeleton /></AdminLayout>;
  if (error) return <AdminLayout><p className="text-red-500">Error: {error.message}</p></AdminLayout>;

  const stats = data?.dashboardStats;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back! Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition-shadow"
          >
            <div className={`text-2xl p-2 rounded-xl mx-auto w-fit mb-2 ${action.color}`}>
              {action.icon}
            </div>
            <div className="text-sm font-medium text-gray-700">{action.label}</div>
          </Link>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          icon="👥"
          color="blue"
          change="+12%"
          changeLabel="vs last month"
        />
        <StatCard
          title="Total Listings"
          value={stats?.totalListings ?? 0}
          icon="🏠"
          color="green"
          change="+5%"
          changeLabel="vs last month"
        />
        <StatCard
          title="Total Bookings"
          value={stats?.totalBookings ?? 0}
          icon="📅"
          color="purple"
          change="+8%"
          changeLabel="vs last month"
        />
        <StatCard
          title="Active Admins"
          value={stats?.activeAdmins ?? 0}
          icon="🛡️"
          color="amber"
          change=""
          changeLabel=""
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">User Growth</h2>
            <span className="text-xs text-gray-400">Last 30 days</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stats?.userGrowth ?? []}>
              <defs>
                <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => v.slice(5)}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#userGrowthGradient)"
                name="Users"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Activity by Action Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Activity by Action</h2>
            <span className="text-xs text-gray-400">All time</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats?.activityByAction ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="action" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
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
          <div className="space-y-3">
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
            <div className="flex justify-between items-center py-2.5 border-b">
              <span className="text-sm text-gray-500">Uptime</span>
              <span className="text-sm font-medium">{stats?.systemHealth?.uptime ?? "—"}</span>
            </div>
            <div className="flex justify-between items-center py-2.5">
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Link href="/admin/audit-logs" className="text-sm text-blue-600 hover:text-blue-800">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {(stats?.recentActivity ?? []).slice(0, 6).map((log: any) => (
              <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  log.action?.includes("DELETE") ? "bg-red-100 text-red-700" :
                  log.action?.includes("CREATE") ? "bg-green-100 text-green-700" :
                  log.action?.includes("UPDATE") ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {log.action}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium capitalize">{log.target}</span>
                  {log.details && (
                    <span className="text-sm text-gray-500 ml-2">— {log.details}</span>
                  )}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
          {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, icon, color, change, changeLabel }: {
  title: string;
  value: number;
  icon: string;
  color: string;
  change: string;
  changeLabel: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`text-2xl p-2 rounded-xl ${colorMap[color]}`}>
          {icon}
        </div>
        {change && (
          <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
            {change}
          </span>
        )}
      </div>
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold mt-1">{value.toLocaleString()}</div>
      {changeLabel && (
        <div className="text-xs text-gray-400 mt-1">{changeLabel}</div>
      )}
    </div>
  );
}

function HealthIndicator({ label, value, healthy }: { label: string; value: string; healthy: boolean }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b">
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

function LoadingSkeleton() {
  return (
    <AdminLayout>
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-64 mb-8" />

        {/* Quick actions skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="h-10 w-10 bg-gray-200 rounded-xl mx-auto mb-2" />
              <div className="h-3 bg-gray-200 rounded w-16 mx-auto" />
            </div>
          ))}
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-5">
              <div className="h-10 w-10 bg-gray-200 rounded-xl mb-3" />
              <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
              <div className="h-7 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
            <div className="h-64 bg-gray-100 rounded" />
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="h-5 bg-gray-200 rounded w-36 mb-4" />
            <div className="h-64 bg-gray-100 rounded" />
          </div>
        </div>

        {/* Bottom skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-100 rounded mb-3" />
            ))}
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
            <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded mb-2" />
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
