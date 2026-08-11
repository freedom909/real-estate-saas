"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { ME } from "../../graphql/auth/auth.queries";
import { UPDATE_ADMIN_ACCOUNT } from "../../graphql/admin/mutations/update.admin.account";
import OwnerLayout from "../../components/owner/OwnerLayout";
import OwnerGuard from "../../components/owner/OwnerGuard";

export default function OwnerProfilePage() {
  return (
    <OwnerGuard>
      <OwnerProfileContent />
    </OwnerGuard>
  );
}

function OwnerProfileContent() {
  const { data, loading, error, refetch } = useQuery<any>(ME);
  const [updateAdminAccount, { loading: updating }] = useMutation<any>(UPDATE_ADMIN_ACCOUNT, {
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

  if (loading) return <OwnerLayout><p>Loading...</p></OwnerLayout>;
  if (error) return <OwnerLayout><p className="text-red-500">Error: {error.message}</p></OwnerLayout>;

  return (
    <OwnerLayout>
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

            <button
              type="submit"
              disabled={updating}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
            >
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Account Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Role</span>
              <span className="font-medium capitalize">{me?.role?.toLowerCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Member since</span>
              <span className="font-medium">
                {me?.createdAt ? new Date(me.createdAt).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
}
