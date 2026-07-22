"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { SYSTEM_SETTINGS } from "../../graphql/admin/queries/admin.queries";
import { UPDATE_SYSTEM_SETTING, DELETE_SYSTEM_SETTING } from "../../graphql/admin/mutations/admin.mutations";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminGuard from "../../components/admin/AdminGuard";

const CATEGORIES = ["general", "security", "notifications", "appearance", "integrations"];

const DEFAULT_SETTINGS = [
  { key: "site_name", value: "Minshuku SaaS", category: "general", description: "Application name displayed across the platform" },
  { key: "site_url", value: "http://localhost:3000", category: "general", description: "Base URL of the application" },
  { key: "support_email", value: "support@minshuku.com", category: "general", description: "Support contact email" },
  { key: "max_upload_size", value: "10", category: "general", description: "Maximum file upload size in MB" },
  { key: "session_timeout", value: "60", category: "security", description: "Session timeout in minutes" },
  { key: "max_login_attempts", value: "5", category: "security", description: "Max failed login attempts before lockout" },
  { key: "lockout_duration", value: "15", category: "security", description: "Account lockout duration in minutes" },
  { key: "require_2fa", value: "false", category: "security", description: "Require two-factor authentication for admins" },
  { key: "email_notifications", value: "true", category: "notifications", description: "Enable email notifications" },
  { key: "booking_notifications", value: "true", category: "notifications", description: "Notify admins of new bookings" },
  { key: "primary_color", value: "#3B82F6", category: "appearance", description: "Primary brand color" },
  { key: "logo_url", value: "", category: "appearance", description: "Custom logo URL" },
  { key: "google_maps_key", value: "", category: "integrations", description: "Google Maps API key" },
  { key: "stripe_key", value: "", category: "integrations", description: "Stripe publishable key" },
];

export default function SettingsPage() {
  return (
    <AdminGuard>
      <SettingsContent />
    </AdminGuard>
  );
}

function SettingsContent() {
  const [activeCategory, setActiveCategory] = useState("general");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSetting, setNewSetting] = useState({ key: "", value: "", description: "" });
  const [msg, setMsg] = useState("");

  const { data, loading, error, refetch } = useQuery(SYSTEM_SETTINGS, {
    variables: { category: activeCategory },
  });

  const [updateSetting] = useMutation(UPDATE_SYSTEM_SETTING, {
    onCompleted: () => { setMsg("Setting updated!"); refetch(); },
    onError: (err) => setMsg(err.message),
  });

  const [deleteSetting] = useMutation(DELETE_SYSTEM_SETTING, {
    onCompleted: () => { setMsg("Setting deleted!"); refetch(); },
    onError: (err) => setMsg(err.message),
  });

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const settings = data?.systemSettings ?? [];

  const handleUpdate = async (key: string, value: string) => {
    setMsg("");
    await updateSetting({ variables: { input: { key, value, category: activeCategory } } });
    setEditingKey(null);
  };

  const handleDelete = async (key: string) => {
    if (confirm(`Delete setting "${key}"?`)) {
      setMsg("");
      await deleteSetting({ variables: { key } });
    }
  };

  const handleSeedDefaults = async () => {
    const defaults = DEFAULT_SETTINGS.filter((s) => s.category === activeCategory);
    for (const s of defaults) {
      await updateSetting({ variables: { input: { key: s.key, value: s.value, category: s.category, description: s.description } } });
    }
    setMsg(`Seeded ${defaults.length} default settings for ${activeCategory}`);
    refetch();
  };

  const handleAddNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSetting.key || !newSetting.value) return;
    setMsg("");
    await updateSetting({
      variables: {
        input: {
          key: newSetting.key,
          value: newSetting.value,
          category: activeCategory,
          description: newSetting.description,
        },
      },
    });
    setNewSetting({ key: "", value: "", description: "" });
    setShowAddForm(false);
    refetch();
  };

  if (loading) return <AdminLayout><p>Loading...</p></AdminLayout>;
  if (error) return <AdminLayout><p className="text-red-500">Error: {error.message}</p></AdminLayout>;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">System Settings</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {showAddForm ? "Cancel" : "+ Add Setting"}
        </button>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          msg.includes("deleted") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
        }`}>
          {msg}
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setMsg(""); }}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border"
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddNew} className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4">
          <h3 className="font-semibold">New Setting</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Key</label>
              <input
                type="text"
                value={newSetting.key}
                onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })}
                className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. site_name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Value</label>
              <input
                type="text"
                value={newSetting.value}
                onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })}
                className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              value={newSetting.description}
              onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
              className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
            Save Setting
          </button>
        </form>
      )}

      {/* Settings Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 border-b bg-gray-50">
          <span className="text-sm font-medium text-gray-500">
            {settings.length} setting(s) in {activeCategory}
          </span>
          <button
            onClick={handleSeedDefaults}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Seed defaults
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left px-6 py-3">Key</th>
              <th className="text-left px-6 py-3">Value</th>
              <th className="text-left px-6 py-3">Description</th>
              <th className="text-left px-6 py-3">Updated</th>
              <th className="text-left px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {settings.map((s: any) => (
              <tr key={s.key} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-sm font-medium">{s.key}</td>
                <td className="px-6 py-4">
                  {editingKey === s.key ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="border rounded px-2 py-1 text-sm w-full"
                      />
                      <button
                        onClick={() => handleUpdate(s.key, editValue)}
                        className="text-green-600 hover:text-green-800 text-sm whitespace-nowrap"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingKey(null)}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-700">{s.value}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs">{s.description || "—"}</td>
                <td className="px-6 py-4 text-gray-400 text-xs">
                  {new Date(s.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  {editingKey !== s.key && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingKey(s.key); setEditValue(s.value); }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s.key)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {settings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No settings in this category.</p>
            <button
              onClick={handleSeedDefaults}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              Seed default settings
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
