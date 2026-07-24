"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { ALL_USERS, USER_COUNT } from "../../graphql/admin/queries/admin.queries";
import { gql } from "@apollo/client/core";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminGuard from "../../components/admin/AdminGuard";

const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($userId: ID!, $name: String, $avatar: String, $role: String) {
    updateProfile(userId: $userId, name: $name, avatar: $avatar, role: $role) {
      id
      name
      role
      profile {
        name
        avatar
      }
    }
  }
`;

const DEACTIVATE_USER = gql`
  mutation DeactivateUser($userId: ID!) {
    deactivateUser(userId: $userId)
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      email
      name
      role
      status
      createdAt
    }
  }
`;

const ROLE_OPTIONS = ["CUSTOMER", "OWNER", "AGENT", "STAFF", "ADMIN"];
const STATUS_OPTIONS = ["ACTIVE", "SUSPENDED", "BANNED"];

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  SUPER_ADMIN: "bg-red-100 text-red-700",
  OWNER: "bg-blue-100 text-blue-700",
  AGENT: "bg-green-100 text-green-700",
  STAFF: "bg-indigo-100 text-indigo-700",
  CUSTOMER: "bg-gray-100 text-gray-700",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  SUSPENDED: "bg-yellow-100 text-yellow-700",
  BANNED: "bg-red-100 text-red-700",
  DELETED: "bg-gray-100 text-gray-500",
};

export default function ManageUsersPage() {
  return (
    <AdminGuard>
      <ManageUsersContent />
    </AdminGuard>
  );
}

function ManageUsersContent() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const limit = 20;

  const { data, loading, error, refetch } = useQuery(ALL_USERS, {
    variables: { limit, offset: page * limit },
  });
  const { data: countData } = useQuery(USER_COUNT);

  const [updateProfile] = useMutation(UPDATE_USER_PROFILE, { onCompleted: () => refetch() });
  const [deactivateUser] = useMutation(DEACTIVATE_USER, { onCompleted: () => refetch() });
  const [createUser] = useMutation(CREATE_USER, { onCompleted: () => { refetch(); setShowCreateForm(false); } });

  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: "", avatar: "", role: "CUSTOMER" });
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [createForm, setCreateForm] = useState({ email: "", name: "", role: "CUSTOMER", password: "" });
  const [msg, setMsg] = useState("");

  const users = data?.users ?? [];
  const totalCount = countData?.userCount ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  const filteredUsers = useMemo(() => {
    return users.filter((u: any) => {
      const matchesSearch = !search ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      const matchesRole = !roleFilter || u.role === roleFilter;
      const matchesStatus = !statusFilter || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const allSelected = filteredUsers.length > 0 && filteredUsers.every((u: any) => selectedIds.has(u.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredUsers.map((u: any) => u.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setEditForm({ name: user.name || "", avatar: user.picture || "", role: user.role || "CUSTOMER" });
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setMsg("");
    try {
      await updateProfile({
        variables: {
          userId: editingUser.id,
          name: editForm.name,
          avatar: editForm.avatar,
          role: editForm.role,
        },
      });
      setMsg("User updated successfully!");
      setEditingUser(null);
    } catch (err: any) {
      setMsg(err.message || "Failed to update user");
    }
  };

  const handleDeactivate = async (userId: string) => {
    if (confirm("Are you sure you want to deactivate this user?")) {
      setMsg("");
      await deactivateUser({ variables: { userId } });
      setMsg("User deactivated.");
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Deactivate ${selectedIds.size} selected users?`)) return;
    setMsg("");
    for (const id of selectedIds) {
      await deactivateUser({ variables: { userId: id } });
    }
    setMsg(`${selectedIds.size} users deactivated.`);
    setSelectedIds(new Set());
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      await createUser({
        variables: {
          input: {
            email: createForm.email,
            name: createForm.name,
            role: createForm.role,
            password: createForm.password,
          },
        },
      });
      setMsg("User created successfully!");
      setCreateForm({ email: "", name: "", role: "CUSTOMER", password: "" });
      setShowCreateForm(false);
    } catch (err: any) {
      setMsg(err.message || "Failed to create user");
    }
  };

  if (loading) return <AdminLayout><LoadingSkeleton /></AdminLayout>;
  if (error) return <AdminLayout><p className="text-red-500">Error: {error.message}</p></AdminLayout>;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-gray-500">{totalCount} total users</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {showCreateForm ? "Cancel" : "+ Create User"}
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

      {/* Create User Form */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4">
          <h3 className="font-semibold">Create New User</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm"
                required
                minLength={8}
              />
            </div>
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
            Create User
          </button>
        </form>
      )}

      {/* Filters & Bulk Actions */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="flex-1 min-w-[200px] border rounded-lg px-4 py-2 text-sm"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Roles</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDeactivate}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
            >
              Deactivate ({selectedIds.size})
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="text-left px-6 py-3">User</th>
              <th className="text-left px-6 py-3">Email</th>
              <th className="text-left px-6 py-3">Role</th>
              <th className="text-left px-6 py-3">Status</th>
              <th className="text-left px-6 py-3">Joined</th>
              <th className="text-left px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user: any) => (
              <tr key={user.id} className={`border-t hover:bg-gray-50 ${selectedIds.has(user.id) ? "bg-blue-50" : ""}`}>
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(user.id)}
                    onChange={() => toggleSelect(user.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {user.picture ? (
                      <img src={user.picture} alt="" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                        {(user.name || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium">{user.name || "Unknown"}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${ROLE_COLORS[user.role] || "bg-gray-100 text-gray-700"}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[user.status] || "bg-gray-100 text-gray-700"}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewingUser(user)}
                      className="text-gray-600 hover:text-gray-800 text-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeactivate(user.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Deactivate
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <p className="text-center py-8 text-gray-500">
            {search || roleFilter || statusFilter ? "No users match your filters." : "No users found."}
          </p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Edit User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
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
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">User Details</h2>
              <button onClick={() => setViewingUser(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              {viewingUser.picture ? (
                <img src={viewingUser.picture} alt="" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                  {(viewingUser.name || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold">{viewingUser.name || "Unknown"}</h3>
                <p className="text-gray-500">{viewingUser.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <DetailItem label="User ID" value={viewingUser.id} />
              <DetailItem label="Role" value={viewingUser.role} badge={ROLE_COLORS[viewingUser.role]} />
              <DetailItem label="Status" value={viewingUser.status} badge={STATUS_COLORS[viewingUser.status]} />
              <DetailItem label="Joined" value={new Date(viewingUser.createdAt).toLocaleDateString()} />
              <DetailItem label="Last Updated" value={new Date(viewingUser.updatedAt).toLocaleDateString()} />
              <DetailItem label="Picture" value={viewingUser.picture || "None"} />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setViewingUser(null); handleEdit(viewingUser); }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit User
              </button>
              <button
                onClick={() => setViewingUser(null)}
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

function DetailItem({ label, value, badge }: { label: string; value: string; badge?: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      {badge ? (
        <span className={`px-2 py-1 rounded-full text-xs ${badge}`}>{value}</span>
      ) : (
        <div className="text-sm font-medium truncate">{value}</div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex gap-4">
          <div className="h-10 bg-gray-200 rounded flex-1" />
          <div className="h-10 bg-gray-200 rounded w-32" />
          <div className="h-10 bg-gray-200 rounded w-32" />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-t">
            <div className="h-4 bg-gray-200 rounded w-4" />
            <div className="h-8 w-8 bg-gray-200 rounded-full" />
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-40" />
            <div className="h-4 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
