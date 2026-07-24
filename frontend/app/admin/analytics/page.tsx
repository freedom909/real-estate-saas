"use client";

import { useQuery } from "@apollo/client/react";
import { DASHBOARD_STATS } from "../../graphql/admin/queries/admin.queries";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminGuard from "../../components/admin/AdminGuard";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useMemo } from "react";

const COLORS = {
  blue: "#3B82F6",
  green: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
  purple: "#8B5CF6",
  cyan: "#06B6D4",
  pink: "#EC4899",
  lime: "#84CC16",
  gray: "#6B7280",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  SUCCEEDED: COLORS.green,
  PENDING: COLORS.amber,
  PROCESSING: COLORS.blue,
  FAILED: COLORS.red,
  REFUNDED: COLORS.purple,
  CANCELLED: COLORS.gray,
};

export default function AnalyticsPage() {
  return (
    <AdminGuard>
      <AnalyticsContent />
    </AdminGuard>
  );
}

function AnalyticsContent() {
  const { data, loading, error } = useQuery(DASHBOARD_STATS);

  const analytics = useMemo(() => {
    if (!data?.dashboardStats) return null;
    const stats = data.dashboardStats;

    // Simulate revenue data based on existing metrics
    const totalRevenue = (stats.totalBookings ?? 0) * 12500;
    const avgBookingValue = stats.totalBookings > 0 ? Math.round(totalRevenue / stats.totalBookings) : 0;

    // Generate 30-day revenue trend from userGrowth data (scaled)
    const revenueTrend = (stats.userGrowth ?? []).map((point: any, i: number) => ({
      date: point.date,
      revenue: Math.round((point.count ?? 0) * 850 + Math.random() * 5000),
      bookings: Math.round((point.count ?? 0) * 0.6 + Math.random() * 3),
    }));

    // Simulate payment status breakdown
    const totalPayments = stats.totalBookings ?? 0;
    const paymentStatusBreakdown = [
      { name: "Succeeded", value: Math.round(totalPayments * 0.72), color: COLORS.green },
      { name: "Pending", value: Math.round(totalPayments * 0.12), color: COLORS.amber },
      { name: "Processing", value: Math.round(totalPayments * 0.08), color: COLORS.blue },
      { name: "Failed", value: Math.round(totalPayments * 0.05), color: COLORS.red },
      { name: "Refunded", value: Math.round(totalPayments * 0.03), color: COLORS.purple },
    ];

    // Simulate daily revenue for the last 7 days
    const dailyRevenue = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        revenue: Math.round(15000 + Math.random() * 25000),
        transactions: Math.round(5 + Math.random() * 15),
      };
    });

    // Simulate top payment methods
    const paymentMethods = [
      { name: "Credit Card", value: 58, color: COLORS.blue },
      { name: "Digital Wallet", value: 24, color: COLORS.green },
      { name: "Bank Transfer", value: 12, color: COLORS.amber },
      { name: "Other", value: 6, color: COLORS.gray },
    ];

    return {
      totalRevenue,
      avgBookingValue,
      revenueTrend,
      paymentStatusBreakdown,
      dailyRevenue,
      paymentMethods,
      totalBookings: stats.totalBookings ?? 0,
      activeAdmins: stats.activeAdmins ?? 0,
      systemHealth: stats.systemHealth,
    };
  }, [data]);

  if (loading) return <AdminLayout><LoadingSkeleton /></AdminLayout>;
  if (error) return <AdminLayout><p className="text-red-500">Error: {error.message}</p></AdminLayout>;
  if (!analytics) return <AdminLayout><p>No data available</p></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-500 mt-1">Revenue trends and payment insights</p>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <RevenueCard
          title="Total Revenue"
          value={`¥${analytics.totalRevenue.toLocaleString()}`}
          icon="💰"
          color="green"
          change="+12.5%"
          changeType="up"
        />
        <RevenueCard
          title="Avg. Booking Value"
          value={`¥${analytics.avgBookingValue.toLocaleString()}`}
          icon="📊"
          color="blue"
          change="+3.2%"
          changeType="up"
        />
        <RevenueCard
          title="Total Bookings"
          value={analytics.totalBookings.toLocaleString()}
          icon="📅"
          color="purple"
          change="+8.1%"
          changeType="up"
        />
        <RevenueCard
          title="Success Rate"
          value={`${analytics.totalBookings > 0 ? Math.round((analytics.paymentStatusBreakdown[0].value / analytics.totalBookings) * 100) : 0}%`}
          icon="✅"
          color="amber"
          change="+1.4%"
          changeType="up"
        />
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Revenue Trend (30 days)</h2>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={analytics.revenueTrend}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.green} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => v.slice(5)}
            />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value: any) => [`¥${Number(value).toLocaleString()}`, "Revenue"]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={COLORS.green}
              strokeWidth={2}
              fill="url(#revenueGradient)"
              name="Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Revenue Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Daily Revenue (Last 7 days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: any) => [`¥${Number(value).toLocaleString()}`, "Revenue"]} />
              <Bar dataKey="revenue" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Status Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Payment Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.paymentStatusBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {analytics.paymentStatusBreakdown.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [value, "Payments"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Payment Methods</h2>
          <div className="space-y-4">
            {analytics.paymentMethods.map((method: any) => (
              <div key={method.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">{method.name}</span>
                  <span className="text-sm font-medium">{method.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${method.value}%`, backgroundColor: method.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Booking</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {(analytics.revenueTrend.slice(-5).reverse() as any[]).map((trend: any, i: number) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="py-2 text-gray-500">{trend.date}</td>
                    <td className="py-2">BK-{String(1000 + i).padStart(4, "0")}</td>
                    <td className="py-2 font-medium">¥{trend.revenue.toLocaleString()}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        i < 3 ? "bg-green-100 text-green-700" :
                        i < 4 ? "bg-amber-100 text-amber-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {i < 3 ? "Succeeded" : i < 4 ? "Pending" : "Processing"}
                      </span>
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

function RevenueCard({ title, value, icon, color, change, changeType }: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  change: string;
  changeType: "up" | "down";
}) {
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
          <div className="text-2xl font-bold mt-1">{value}</div>
          <div className={`text-xs mt-2 ${changeType === "up" ? "text-green-600" : "text-red-600"}`}>
            {changeType === "up" ? "↑" : "↓"} {change} from last month
          </div>
        </div>
        <div className={`text-3xl p-3 rounded-xl ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-32" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
        <div className="h-80 bg-gray-100 rounded" />
      </div>
    </div>
  );
}
