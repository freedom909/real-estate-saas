"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { ME } from "../../graphql/auth/auth.queries";
import { UPDATE_PROFILE } from "../../graphql/admin/mutations/admin.mutations";
import AccountLayout from "../../components/account/AccountLayout";

export default function AccountProfilePage() {
  return (
    <AccountLayout>
      <AccountProfileContent />
    </AccountLayout>
  );
}

function AccountProfileContent() {
  const { data, loading, error, refetch } = useQuery<any>(ME);
  const [updateProfile, { loading: updating }] = useMutation<any>(UPDATE_PROFILE, {
    onCompleted: () => {
      setMsg("Profile updated successfully!");
      refetch();
    },
    onError: (err) => setMsg(err.message),
  });

  const [form, setForm] = useState({ name: "", avatar: "" });
  const [msg, setMsg] = useState("");

  const me = data?.me;

  useEffect(() => {
    if (me) {
      setForm({ name: me.name || "", avatar: me.picture || "" });
    }
  }, [me]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    await updateProfile({
      variables: { input: { name: form.name, avatar: form.avatar } },
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600">Error: {error.message}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Profile Information</h2>

          {msg && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              msg.includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={me?.email || ""}
                disabled
                className="mt-1 block w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
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
              <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
              <input
                type="url"
                value={form.avatar}
                onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                className="mt-1 block w-full border rounded-lg px-3 py-2"
                placeholder="https://example.com/avatar.jpg"
              />
              {form.avatar && (
                <img src={form.avatar} alt="Avatar preview" className="mt-2 h-16 w-16 rounded-full object-cover" />
              )}
            </div>

            <button
              type="submit"
              disabled={updating}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </form>

          {/* Account Info */}
          <div className="mt-6 pt-4 border-t space-y-2 text-sm text-gray-500">
            <div className="flex justify-between">
              <span className="font-medium">Role</span>
              <span>{me?.role || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status</span>
              <span className="text-green-600">Active</span>
            </div>
          </div>
        </div>

        {/* Avatar Preview */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Preview</h2>
          <div className="flex flex-col items-center justify-center py-8">
            {me?.picture || form.avatar ? (
              <img
                src={form.avatar || me?.picture}
                alt="Avatar"
                className="h-24 w-24 rounded-full object-cover border-4 border-blue-100"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-white text-3xl font-bold">
                {(me?.name || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="mt-4 text-center">
              <div className="text-lg font-semibold">{form.name || me?.name || "User"}</div>
              <div className="text-sm text-gray-500">{me?.email || ""}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
