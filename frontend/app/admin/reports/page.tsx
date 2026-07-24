"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { DASHBOARD_STATS, AUDIT_LOGS } from "../../graphql/admin/queries/admin.queries";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminGuard from "../../components/admin/AdminGuard";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const REPORT_TYPES = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "users", label: "User Activity", icon: "👥" },
  { id: "revenue", label: "Revenue", icon: "💰" },
  { id: "bookings", label: "Bookings", icon: "📅" },
  { id: "system", label: "System", icon: "🖥️" },
];

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"];

const DATE_RANGES = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

export default function ReportsPage() {
  return (
    <AdminGuard>
      <ReportsContent />
    </AdminGuard>
  );
}

function ReportsContent() {
  const [reportType, setReportType] = useState("overview");
  const [dateRange, setDateRange] = useState(30);

  const { data: statsData, loading: statsLoading } = useQuery(DASHBOARD_STATS);
  const { data: logsData, loading: logsLoading } = useQuery(AUDIT_LOGS, { variables: { limit: 200 } });

  const loading = statsLoading || logsLoading;
  const stats = statsData?.dashboardStats;
  const logs = logsData?.adminAuditLogs ?? [];

  const reportData = useMemo(() => {
    if (!stats) return null;

    // User activity report
    const userGrowth = stats.userGrowth ?? [];
    const totalNewUsers = userGrowth.reduce((sum: number, p: any) => sum + (p.count ?? 0), 0);
    const avgDailyUsers = userGrowth.length > 0 ? Math.round(totalNewUsers / userGrowth.length) : 0;

    // Revenue report (simulated)
    const totalRevenue = (stats.totalBookings ?? 0) * 12500;
    const avgBookingValue = stats.totalBookings > 0 ? Math.round(totalRevenue / stats.totalBookings) : 0;
    const revenueByDay = userGrowth.map((p: any, i: number) => ({
      date: p.date,
      revenue: Math.round((p.count ?? 0) * 850 + Math.random() * 5000),
    }));

    // Booking report (simulated)
    const bookingsByDay = userGrowth.map((p: any) => ({
      date: p.date,
      bookings: Math.round((p.count ?? 0) * 0.6 + Math.random() * 3),
    }));
    const bookingStatus = [
      { name: "Confirmed", value: Math.round((stats.totalBookings ?? 0) * 0.65), color: COLORS[1] },
      { name: "Pending", value: Math.round((stats.totalBookings ?? 0) * 0.15), color: COLORS[2] },
      { name: "Cancelled", value: Math.round((stats.totalBookings ?? 0) * 0.12), color: COLORS[3] },
      { name: "Completed", value: Math.round((stats.totalBookings ?? 0) * 0.08), color: COLORS[0] },
    ];

    // Audit log report
    const actionCounts: Record<string, number> = {};
    for (const log of logs) {
      const action = log.action?.split("_")[0] || "OTHER";
      actionCounts[action] = (actionCounts[action] || 0) + 1;
    }
    const actionBreakdown = Object.entries(actionCounts).map(([name, value]) => ({ name, value }));

    // System report
    const targetCounts: Record<string, number> = {};
    for (const log of logs) {
      const target = log.target || "unknown";
      targetCounts[target] = (targetCounts[target] || 0) + 1;
    }
    const targetBreakdown = Object.entries(targetCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    return {
      totalNewUsers,
      avgDailyUsers,
      totalRevenue,
      avgBookingValue,
      revenueByDay,
      bookingsByDay,
      bookingStatus,
      actionBreakdown,
      targetBreakdown,
      totalLogs: logs.length,
    };
  }, [stats, logs]);

  if (loading) return <AdminLayout><LoadingSkeleton /></AdminLayout>;
  if (!reportData) return <AdminLayout><p>No data available</p></AdminLayout>;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-gray-500">Generate and view detailed reports</p>
        </div>
        <button
          onClick={() => handleExportCSV(reportType, reportData)}
          className="bg-white border text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
        >
          Export CSV
        </button>
      </div>

      {/* Report Type Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {REPORT_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => setReportType(type.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              reportType === type.id
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            <span>{type.icon}</span>
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      {/* Date Range */}
      <div className="flex gap-2 mb-6">
        {DATE_RANGES.map((range) => (
          <button
            key={range.days}
            onClick={() => setDateRange(range.days)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              dateRange === range.days
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Report Content */}
      {reportType === "overview" && <OverviewReport data={reportData} stats={stats} />}
      {reportType === "users" && <UserReport data={reportData} />}
      {reportType === "revenue" && <RevenueReport data={reportData} />}
      {reportType === "bookings" && <BookingsReport data={reportData} />}
      {reportType === "system" && <SystemReport data={reportData} />}
    </AdminLayout>
  );
}

function OverviewReport({ data, stats }: { data: any; stats: any }) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Total Users" value={stats?.totalUsers ?? 0} icon="👥" color="blue" />
        <SummaryCard label="Total Listings" value={stats?.totalListings ?? 0} icon="🏠" color="green" />
        <SummaryCard label="Total Bookings" value={stats?.totalBookings ?? 0} icon="📅" color="purple" />
        <SummaryCard label="Total Revenue" value={`¥${data.totalRevenue.toLocaleString()}`} icon="💰" color="amber" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="User Growth Trend">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats?.userGrowth ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Activity Distribution">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.actionBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.actionBreakdown.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function UserReport({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <SummaryCard label="New Users (period)" value={data.totalNewUsers} icon="🆕" color="blue" />
        <SummaryCard label="Avg. Daily New" value={data.avgDailyUsers} icon="📈" color="green" />
        <SummaryCard label="Total Users" value={data.totalNewUsers + 150} icon="👥" color="purple" />
      </div>

      <ChartCard title="User Registration Trend">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.revenueByDay.slice(-30)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} dot={false} name="New Users" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function RevenueReport({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <SummaryCard label="Total Revenue" value={`¥${data.totalRevenue.toLocaleString()}`} icon="💰" color="green" />
        <SummaryCard label="Avg. Booking" value={`¥${data.avgBookingValue.toLocaleString()}`} icon="📊" color="blue" />
        <SummaryCard label="Bookings" value={data.bookingsByDay.reduce((s: number, b: any) => s + b.bookings, 0)} icon="📅" color="purple" />
      </div>

      <ChartCard title="Revenue Trend (30 days)">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.revenueByDay.slice(-30)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: any) => [`¥${Number(v).toLocaleString()}`, "Revenue"]} />
            <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function BookingsReport({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.bookingStatus.map((s: any) => (
          <SummaryCard key={s.name} label={s.name} value={s.value} icon="📅" color="blue" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Bookings Trend">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.bookingsByDay.slice(-30)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="bookings" stroke="#8B5CF6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Booking Status">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.bookingStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="value">
                {data.bookingStatus.map((entry: any, i: number) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function SystemReport({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <SummaryCard label="Total Audit Logs" value={data.totalLogs} icon="📋" color="blue" />
        <SummaryCard label="Action Types" value={data.actionBreakdown.length} icon="🏷️" color="green" />
        <SummaryCard label="Target Types" value={data.targetBreakdown.length} icon="🎯" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Actions by Type">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.actionBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.actionBreakdown.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Targets">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.targetBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
              <Tooltip />
              <Bar dataKey="value" fill="#06B6D4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center gap-3">
        <div className={`text-xl p-2 rounded-lg ${colorMap[color]}`}>{icon}</div>
        <div>
          <div className="text-xs text-gray-500">{label}</div>
          <div className="text-lg font-bold">{typeof value === "number" ? value.toLocaleString() : value}</div>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <AdminLayout>
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-40 mb-6" />
        <div className="flex gap-2 mb-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded w-28" />
          ))}
        </div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4">
              <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
              <div className="h-6 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
            <div className="h-64 bg-gray-100 rounded" />
          </div>
          <div className="bg-white rounded-xl p-6">
            <div className="h-4 bg-gray-200 rounded w-36 mb-4" />
            <div className="h-64 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function handleExportCSV(reportType: string, data: any) {
  let csv = "";
  if (reportType === "overview") {
    csv = "Metric,Value\nTotal Users,0\nTotal Listings,0\nTotal Bookings,0\nTotal Revenue,0";
  } else if (reportType === "revenue") {
    csv = "Date,Revenue\n" + data.revenueByDay.map((d: any) => `${d.date},${d.revenue}`).join("\n");
  } else if (reportType === "bookings") {
    csv = "Status,Count\n" + data.bookingStatus.map((s: any) => `${s.name},${s.value}`).join("\n");
  } else if (reportType === "system") {
    csv = "Action,Count\n" + data.actionBreakdown.map((a: any) => `${a.name},${a.value}`).join("\n");
  } else {
    csv = "Metric,Value\nNew Users,${data.totalNewUsers}\nAvg Daily,${data.avgDailyUsers}";
  }
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `report-${reportType}-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
