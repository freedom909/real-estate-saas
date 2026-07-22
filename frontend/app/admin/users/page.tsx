"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { ADMIN_USERS } from "../../graphql/admin/queries/admin.queries";
import { CREATE_ADMIN_USER, DELETE_ADMIN_USER } from "../../graphql/admin/mutations/admin.mutations";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminGuard from "../../components/admin/AdminGuard";

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
  const [deleteAdminUser] = useMutation(DELETE_ADMIN_USER, { onCompleted: () => refetch() });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", role: "ADMIN" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAdminUser({ variables: { input: form } });
    setForm({ email: "", name: "", role: "ADMIN" });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this admin?")) {
      await deleteAdminUser({ variables: { id } });
    }
  };

  if (loading) return <AdminLayout><p>Loading...</p></AdminLayout>;
  if (error) return <AdminLayout><p className="text-red-500">Error: {error.message}</p></AdminLayout>;

  const admins = data?.adminUsers ?? [];

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Users</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ Add Admin"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 block w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 block w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="mt-1 block w-full border rounded-lg px-3 py-2"
            >
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="MODERATOR">Moderator</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Create Admin
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3">Name</th>
              <th className="text-left px-6 py-3">Email</th>
              <th className="text-left px-6 py-3">Role</th>
              <th className="text-left px-6 py-3">Status</th>
              <th className="text-left px-6 py-3">Created</th>
              <th className="text-left px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin: any) => (
              <tr key={admin.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{admin.name}</td>
                <td className="px-6 py-4 text-gray-500">{admin.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    admin.role === "SUPER_ADMIN" ? "bg-purple-100 text-purple-700" :
                    admin.role === "ADMIN" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
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
                <td className="px-6 py-4 text-gray-400">
                  {new Date(admin.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(admin.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {admins.length === 0 && (
          <p className="text-center py-8 text-gray-500">No admin users found.</p>
        )}
      </div>
    </AdminLayout>
  );
}
