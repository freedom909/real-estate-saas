"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { ME } from "../../graphql/auth/auth.queries";
import { UPDATE_ADMIN_ACCOUNT } from "../../graphql/admin/mutations/update.admin.account";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminGuard from "../../components/admin/AdminGuard";

export default function AdminProfilePage() {
  return (
    <AdminGuard>
      <AdminProfileContent />
    </AdminGuard>
  );
}



function AdminProfileContent() {
  const { data, loading, error, refetch } = useQuery(ME);
  const [updateAdminAccount, { loading: updatingAdminAccount }] = useMutation(UPDATE_ADMIN_ACCOUNT, {
    onCompleted: () => {
      setProfileMsg("Profile updated successfully!");
      refetch();
    },
    onError: (err) => setProfileMsg(err.message),
  });


  const [profileForm, setProfileForm] = useState({ name: "", avatar: "" });

  const [profileMsg, setProfileMsg] = useState("");
 

  const me = data?.me;

  useEffect(() => {
    if (me) {
      setProfileForm({ name: me.name || "", avatar: me.avatar || "" });
    }
  }, [me]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg("");
    await updateAdminAccount({ variables: { input: { name: profileForm.name, avatar: profileForm.avatar } } });
  };



  if (loading) return <AdminLayout><p>Loading...</p></AdminLayout>;
  if (error) return <AdminLayout><p className="text-red-500">Error: {error.message}</p></AdminLayout>;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Profile Information</h2>

          {profileMsg && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              profileMsg.includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {profileMsg}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
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
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="mt-1 block w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
              <input
                type="url"
                value={profileForm.avatar}
                onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                className="mt-1 block w-full border rounded-lg px-3 py-2"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={updatingAdminAccount}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {updatingAdminAccount ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>

          {/* Account Info */}
          <div className="mt-6 pt-4 border-t space-y-2 text-sm text-gray-500">
            <div><span className="font-medium">Role:</span> {me?.role}</div>
            <div><span className="font-medium">Status:</span> {me?.isActive ? "Active" : "Inactive"}</div>
            <div><span className="font-medium">Joined:</span> {me?.createdAt ? new Date(me.createdAt).toLocaleDateString() : "—"}</div>
            <div><span className="font-medium">Last Login:</span> {me?.lastLoginAt ? new Date(me.lastLoginAt).toLocaleString() : "—"}</div>
          </div>
        </div>

        {/* Change Other Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Change Other Settings</h2>

       


        </div>
      </div>
    </AdminLayout>
  );
}
