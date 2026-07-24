"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { ADMIN_USERS } from "../../graphql/admin/queries/admin.queries";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminGuard from "../../components/admin/AdminGuard";

interface RoleDef {
  id: string;
  label: string;
  level: number;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
  permissions: string[];
}

const ALL_PERMISSIONS = [
  { id: "dashboard:view", category: "Dashboard", label: "View Dashboard" },
  { id: "admin_users:view", category: "Admin Users", label: "View Admins" },
  { id: "admin_users:create", category: "Admin Users", label: "Create Admins" },
  { id: "admin_users:update", category: "Admin Users", label: "Update Admins" },
  { id: "admin_users:delete", category: "Admin Users", label: "Delete Admins" },
  { id: "users:view", category: "Users", label: "View Users" },
  { id: "users:create", category: "Users", label: "Create Users" },
  { id: "users:update", category: "Users", label: "Update Users" },
  { id: "users:deactivate", category: "Users", label: "Deactivate Users" },
  { id: "audit_logs:view", category: "Audit Logs", label: "View Logs" },
  { id: "audit_logs:create", category: "Audit Logs", label: "Create Logs" },
  { id: "settings:view", category: "Settings", label: "View Settings" },
  { id: "settings:update", category: "Settings", label: "Update Settings" },
  { id: "settings:delete", category: "Settings", label: "Delete Settings" },
  { id: "profile:view", category: "Profile", label: "View Profile" },
  { id: "profile:update", category: "Profile", label: "Update Profile" },
];

const ROLES: RoleDef[] = [
  {
    id: "SUPER_ADMIN", label: "Super Admin", level: 7, color: "text-red-700", bgColor: "bg-red-50",
    icon: "👑", description: "Full platform control. Can manage all settings, users, and destructive operations.",
    permissions: ["dashboard:view", "admin_users:view", "admin_users:create", "admin_users:update", "admin_users:delete",
      "users:view", "users:create", "users:update", "users:deactivate", "audit_logs:view", "audit_logs:create",
      "settings:view", "settings:update", "settings:delete", "profile:view", "profile:update"],
  },
  {
    id: "ADMIN", label: "Admin", level: 6, color: "text-blue-700", bgColor: "bg-blue-50",
    icon: "🛡️", description: "Platform admin. Can manage users, settings, and view all data.",
    permissions: ["dashboard:view", "admin_users:view", "admin_users:create", "admin_users:update",
      "users:view", "users:create", "users:update", "users:deactivate", "audit_logs:view", "audit_logs:create",
      "settings:view", "settings:update", "profile:view", "profile:update"],
  },
  {
    id: "OWNER", label: "Owner", level: 5, color: "text-indigo-700", bgColor: "bg-indigo-50",
    icon: "🏠", description: "Listing owner. Can manage own listings and bookings.",
    permissions: ["dashboard:view", "users:view", "audit_logs:view", "profile:view", "profile:update"],
  },
  {
    id: "AGENT", label: "Agent", level: 4, color: "text-green-700", bgColor: "bg-green-50",
    icon: "🤖", description: "Listing management agent. Can create and update listings.",
    permissions: ["dashboard:view", "profile:view", "profile:update"],
  },
  {
    id: "MODERATOR", label: "Moderator", level: 3, color: "text-gray-700", bgColor: "bg-gray-50",
    icon: "🔧", description: "Content moderator. Can view dashboards, users, and audit logs.",
    permissions: ["dashboard:view", "users:view", "audit_logs:view", "profile:view", "profile:update"],
  },
  {
    id: "STAFF", label: "Staff", level: 2, color: "text-purple-700", bgColor: "bg-purple-50",
    icon: "👤", description: "Basic staff access. Limited read-only permissions.",
    permissions: ["dashboard:view", "profile:view", "profile:update"],
  },
  {
    id: "CUSTOMER", label: "Customer", level: 1, color: "text-amber-700", bgColor: "bg-amber-50",
    icon: "🛒", description: "End user. Can browse listings and make bookings.",
    permissions: ["profile:view", "profile:update"],
  },
  {
    id: "GUEST", label: "Guest", level: 0, color: "text-gray-500", bgColor: "bg-gray-50",
    icon: "👤", description: "Unauthenticated user. Read-only access to public content.",
    permissions: [],
  },
];

const PERMISSION_CATEGORIES = [...new Set(ALL_PERMISSIONS.map((p) => p.category))];

export default function RolesPage() {
  return (
    <AdminGuard>
      <RolesContent />
    </AdminGuard>
  );
}

function RolesContent() {
  const { data } = useQuery(ADMIN_USERS);
  const [viewingRole, setViewingRole] = useState<RoleDef | null>(null);
  const [showMatrix, setShowMatrix] = useState(false);

  const admins = data?.adminUsers ?? [];

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of admins) {
      counts[a.role] = (counts[a.role] || 0) + 1;
    }
    return counts;
  }, [admins]);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Roles & Permissions</h1>
          <p className="text-sm text-gray-500">{ROLES.length} roles defined, {admins.length} admin users</p>
        </div>
        <button
          onClick={() => setShowMatrix(!showMatrix)}
          className="bg-white border text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
        >
          {showMatrix ? "Hide" : "Show"} Permission Matrix
        </button>
      </div>

      {/* Role Hierarchy */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Role Hierarchy</h2>
        <div className="relative">
          {/* Hierarchy line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-3">
            {ROLES.map((role) => (
              <div
                key={role.id}
                className="relative flex items-center gap-4 pl-4 cursor-pointer group"
                onClick={() => setViewingRole(role)}
              >
                {/* Hierarchy dot */}
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${role.bgColor} ${role.color} border-2 border-white shadow-sm`}>
                  {role.level}
                </div>

                {/* Role card */}
                <div className="flex-1 bg-white rounded-xl shadow-sm p-4 group-hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{role.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${role.color}`}>{role.label}</span>
                          <span className="text-xs text-gray-400">Level {role.level}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{role.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{roleCounts[role.id] || 0}</div>
                      <div className="text-xs text-gray-400">users</div>
                    </div>
                  </div>

                  {/* Permission preview */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {role.permissions.slice(0, 6).map((perm) => (
                      <span key={perm} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {perm}
                      </span>
                    ))}
                    {role.permissions.length > 6 && (
                      <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                        +{role.permissions.length - 6} more
                      </span>
                    )}
                    {role.permissions.length === 0 && (
                      <span className="text-xs text-gray-400 italic">No permissions</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Permission Matrix */}
      {showMatrix && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold">Permission Matrix</h2>
            <p className="text-sm text-gray-500">Which roles have which permissions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left px-6 py-3 font-medium text-gray-500 sticky left-0 bg-gray-50">Permission</th>
                  {ROLES.map((role) => (
                    <th key={role.id} className="text-center px-4 py-3 font-medium min-w-[80px]">
                      <span className={role.color}>{role.icon}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSION_CATEGORIES.map((cat) => (
                  <>
                    <tr key={`cat-${cat}`} className="bg-gray-50">
                      <td colSpan={ROLES.length + 1} className="px-6 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wide">
                        {cat}
                      </td>
                    </tr>
                    {ALL_PERMISSIONS.filter((p) => p.category === cat).map((perm) => (
                      <tr key={perm.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-2.5 text-gray-600 sticky left-0 bg-white">{perm.label}</td>
                        {ROLES.map((role) => (
                          <td key={role.id} className="text-center px-4 py-2.5">
                            {role.permissions.includes(perm.id) ? (
                              <span className="inline-block w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs leading-5">✓</span>
                            ) : (
                              <span className="inline-block w-5 h-5 rounded-full bg-gray-100 text-gray-400 text-xs leading-5">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ROLES.slice(0, 4).map((role) => (
          <div key={role.id} className={`rounded-xl p-4 ${role.bgColor} border`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{role.icon}</span>
              <span className={`font-semibold text-sm ${role.color}`}>{role.label}</span>
            </div>
            <div className="text-2xl font-bold">{roleCounts[role.id] || 0}</div>
            <div className="text-xs text-gray-500 mt-1">{role.permissions.length} permissions</div>
          </div>
        ))}
      </div>

      {/* View Role Modal */}
      {viewingRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setViewingRole(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{viewingRole.icon}</span>
                <div>
                  <h2 className={`text-xl font-bold ${viewingRole.color}`}>{viewingRole.label}</h2>
                  <span className="text-sm text-gray-500">Level {viewingRole.level}</span>
                </div>
              </div>
              <button onClick={() => setViewingRole(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <p className="text-gray-600 mb-4">{viewingRole.description}</p>

            <div className="flex items-center gap-4 mb-6 text-sm">
              <div className="bg-gray-50 rounded-lg px-3 py-2">
                <div className="text-gray-500">Users</div>
                <div className="font-bold">{roleCounts[viewingRole.id] || 0}</div>
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2">
                <div className="text-gray-500">Permissions</div>
                <div className="font-bold">{viewingRole.permissions.length}</div>
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2">
                <div className="text-gray-500">Level</div>
                <div className="font-bold">{viewingRole.level}</div>
              </div>
            </div>

            <h3 className="font-semibold mb-3">Permissions</h3>
            <div className="space-y-2">
              {PERMISSION_CATEGORIES.map((cat) => {
                const perms = ALL_PERMISSIONS.filter((p) => p.category === cat && viewingRole.permissions.includes(p.id));
                if (perms.length === 0) return null;
                return (
                  <div key={cat}>
                    <div className="text-xs font-medium text-gray-500 uppercase mb-1">{cat}</div>
                    <div className="flex flex-wrap gap-1">
                      {perms.map((p) => (
                        <span key={p.id} className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full">
                          {p.label}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
              {viewingRole.permissions.length === 0 && (
                <p className="text-sm text-gray-400 italic">No permissions assigned</p>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewingRole(null)}
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
