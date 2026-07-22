"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { ALL_USERS, USER_COUNT } from "../../graphql/admin/queries/admin.queries";
import { gql } from "@apollo/client/core";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminGuard from "../../components/admin/AdminGuard";

const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($userId: ID!, $name: String, $avatar: String) {
    updateProfile(userId: $userId, name: $name, avatar: $avatar) {
      id
      name
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const limit = 20;

  const { data, loading, error, refetch } = useQuery(ALL_USERS, {
    variables: { limit, offset: page * limit },
  });
  const { data: countData } = useQuery(USER_COUNT);

  const [updateProfile] = useMutation(UPDATE_USER_PROFILE, { onCompleted: () => refetch() });
  const [deactivateUser] = useMutation(DEACTIVATE_USER, { onCompleted: () => refetch() });
  const [createUser] = useMutation(CREATE_USER, { onCompleted: () => { refetch(); setShowCreateForm(false); } });

  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: "", avatar: "" });
  const [createForm, setCreateForm] = useState({ email: "", name: "", role: "CUSTOMER", password: "" });
  const [msg, setMsg] = useState("");

  const users = data?.users ?? [];
  const totalCount = countData?.userCount ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  const filteredUsers = search
    ? users.filter((u: any) =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setEditForm({ name: user.name || "", avatar: user.picture || "" });
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setMsg("");
    await updateProfile({
      variables: {
        userId: editingUser.id,
        name: editForm.name,
        avatar: editForm.avatar,
      },
    });
    setMsg("User updated successfully!");
    setEditingUser(null);
  };

  const handleDeactivate = async (userId: string) => {
    if (confirm("Are you sure you want to deactivate this user?")) {
      setMsg("");
      await deactivateUser({ variables: { userId } });
      setMsg("User deactivated.");
    }
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

  if (loading) return <AdminLayout><p>Loading...</p></AdminLayout>;
  if (error) return <AdminLayout><p className="text-red-500">Error: {error.message}</p></AdminLayout>;

  return (
    <AdminLayout>
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
                <option value="CUSTOMER">Customer</option>
                <option value="OWNER">Owner</option>
                <option value="AGENT">Agent</option>
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

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full md:w-96 border rounded-lg px-4 py-2 text-sm"
        />
      </div>

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

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
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
              <tr key={user.id} className="border-t hover:bg-gray-50">
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
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.role === "ADMIN" ? "bg-purple-100 text-purple-700" :
                    user.role === "OWNER" ? "bg-blue-100 text-blue-700" :
                    user.role === "AGENT" ? "bg-green-100 text-green-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                    user.status === "SUSPENDED" ? "bg-yellow-100 text-yellow-700" :
                    user.status === "BANNED" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
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
            {search ? "No users match your search." : "No users found."}
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
    </AdminLayout>
  );
}
