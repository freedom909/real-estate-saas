"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { ADMIN_USERS } from "../../graphql/admin/queries/admin.queries";
import { CREATE_ADMIN_USER, UPDATE_ADMIN_USER, DELETE_ADMIN_USER } from "../../graphql/admin/mutations/admin.mutations";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminGuard from "../../components/admin/AdminGuard";

const ROLE_OPTIONS = ["SUPER_ADMIN", "ADMIN", "MODERATOR", "STAFF"];
const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-700",
  ADMIN: "bg-blue-100 text-blue-700",
  MODERATOR: "bg-gray-100 text-gray-700",
  STAFF: "bg-indigo-100 text-indigo-700",
};

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <AdminUsersContent />
    </AdminGuard>
  );
}

function AdminUsersContent() {
  const { data, loading, error, refetch } = useQuery(ADMIN_USERS);
  const [createAdminUser] = useMutation(CREATE_ADMIN_USER, { onCompleted: () => refetch() });
  const [updateAdminUser] = useMutation(UPDATE_ADMIN_USER, { onCompleted: () => refetch() });
  const [deleteAdminUser] = useMutation(DELETE_ADMIN_USER, { onCompleted: () => refetch() });

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [viewingAdmin, setViewingAdmin] = useState<any>(null);
  const [editingAdmin, setEditingAdmin] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: "", role: "ADMIN", avatar: "" });

  const [form, setForm] = useState({ email: "", name: "", role: "ADMIN", avatar: "" });
  const [msg, setMsg] = useState("");

  const admins = data?.adminUsers ?? [];

  const stats = useMemo(() => {
    const total = admins.length;
    const active = admins.filter((a: any) => a.isActive).length;
    const byRole: Record<string, number> = {};
    for (const a of admins) {
      byRole[a.role] = (byRole[a.role] || 0) + 1;
    }
    return { total, active, inactive: total - active, byRole };
  }, [admins]);

  const filteredAdmins = useMemo(() => {
    if (!search) return admins;
    const q = search.toLowerCase();
    return admins.filter((a: any) =>
      a.name?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.role?.toLowerCase().includes(q)
    );
  }, [admins, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      await createAdminUser({ variables: { input: form } });
      setMsg("Admin created successfully!");
      setForm({ email: "", name: "", role: "ADMIN", avatar: "" });
      setShowForm(false);
    } catch (err: any) {
      setMsg(err.message || "Failed to create admin");
    }
  };

  const handleEdit = (admin: any) => {
    setEditingAdmin(admin);
    setEditForm({ name: admin.name || "", role: admin.role || "ADMIN", avatar: admin.avatar || "" });
  };

  const handleSaveEdit = async () => {
    if (!editingAdmin) return;
    setMsg("");
    try {
      await updateAdminUser({
        variables: { id: editingAdmin.id, input: editForm },
      });
      setMsg("Admin updated successfully!");
      setEditingAdmin(null);
    } catch (err: any) {
      setMsg(err.message || "Failed to update admin");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this admin?")) {
      setMsg("");
      try {
        await deleteAdminUser({ variables: { id } });
        setMsg("Admin deleted.");
      } catch (err: any) {
        setMsg(err.message || "Failed to delete admin");
      }
    }
  };

  if (loading) return <AdminLayout><LoadingSkeleton /></AdminLayout>;
  if (error) return <AdminLayout><p className="text-red-500">Error: {error.message}</p></AdminLayout>;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Users</h1>
          <p className="text-sm text-gray-500">{stats.total} admin(s), {stats.active} active</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ Add Admin"}
        </button>
      </div>

      {/* Message */}
      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          msg.includes("Failed") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
        }`}>
          {msg}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Admins" value={stats.total} icon="👥" color="blue" />
        <StatCard label="Active" value={stats.active} icon="✅" color="green" />
        <StatCard label="Inactive" value={stats.inactive} icon="⏸️" color="amber" />
        <StatCard label="Super Admins" value={stats.byRole["SUPER_ADMIN"] || 0} icon="👑" color="red" />
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4">
          <h3 className="font-semibold">Create New Admin</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
              <input
                type="url"
                value={form.avatar}
                onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="https://..."
              />
            </div>
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
            Create Admin
          </button>
        </form>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or role..."
          className="w-full md:w-96 border rounded-lg px-4 py-2 text-sm"
        />
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3">Admin</th>
              <th className="text-left px-6 py-3">Email</th>
              <th className="text-left px-6 py-3">Role</th>
              <th className="text-left px-6 py-3">Status</th>
              <th className="text-left px-6 py-3">Last Login</th>
              <th className="text-left px-6 py-3">Created</th>
              <th className="text-left px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.map((admin: any) => (
              <tr key={admin.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {admin.avatar ? (
                      <img src={admin.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                        {(admin.name || "A").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium">{admin.name || "Unknown"}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">{admin.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[admin.role] || "bg-gray-100 text-gray-700"}`}>
                    {admin.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    admin.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {admin.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400 text-xs">
                  {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : "Never"}
                </td>
                <td className="px-6 py-4 text-gray-400 text-xs">
                  {new Date(admin.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setViewingAdmin(admin)}
                      className="text-gray-600 hover:text-gray-800 text-sm px-2 py-1 rounded hover:bg-gray-100"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(admin)}
                      className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded hover:bg-blue-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(admin.id)}
                      className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAdmins.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">👤</div>
            <p>{search ? "No admins match your search." : "No admin users found."}</p>
          </div>
        )}
      </div>

      {/* View Admin Modal */}
      {viewingAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setViewingAdmin(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Admin Details</h2>
              <button onClick={() => setViewingAdmin(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              {viewingAdmin.avatar ? (
                <img src={viewingAdmin.avatar} alt="" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                  {(viewingAdmin.name || "A").charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold">{viewingAdmin.name || "Unknown"}</h3>
                <p className="text-gray-500">{viewingAdmin.email}</p>
                <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[viewingAdmin.role] || "bg-gray-100"}`}>
                  {viewingAdmin.role}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <DetailItem label="Admin ID" value={viewingAdmin.id} mono />
              <DetailItem label="Status" value={viewingAdmin.isActive ? "Active" : "Inactive"} />
              <DetailItem label="Created" value={new Date(viewingAdmin.createdAt).toLocaleString()} />
              <DetailItem label="Last Login" value={viewingAdmin.lastLoginAt ? new Date(viewingAdmin.lastLoginAt).toLocaleString() : "Never"} />
              <DetailItem label="Updated" value={new Date(viewingAdmin.updatedAt).toLocaleString()} />
              <DetailItem label="Avatar" value={viewingAdmin.avatar || "None"} />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setViewingAdmin(null); handleEdit(viewingAdmin); }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit Admin
              </button>
              <button
                onClick={() => setViewingAdmin(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {editingAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditingAdmin(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Edit Admin</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={editingAdmin.email}
                  disabled
                  className="mt-1 block w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 block w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="mt-1 block w-full border rounded-lg px-3 py-2"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
                <input
                  type="url"
                  value={editForm.avatar}
                  onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                  className="mt-1 block w-full border rounded-lg px-3 py-2"
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setEditingAdmin(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500">{label}</div>
          <div className="text-2xl font-bold mt-1">{value}</div>
        </div>
        <div className={`text-2xl p-2 rounded-xl ${colorMap[color]}`}>{icon}</div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-sm font-medium truncate ${mono ? "font-mono text-xs" : ""}`}>{value}</div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <AdminLayout>
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4">
              <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
              <div className="h-7 bg-gray-200 rounded w-12" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-t">
              <div className="h-8 w-8 bg-gray-200 rounded-full" />
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-4 bg-gray-200 rounded w-40" />
              <div className="h-6 bg-gray-200 rounded w-16" />
              <div className="h-6 bg-gray-200 rounded w-14" />
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
