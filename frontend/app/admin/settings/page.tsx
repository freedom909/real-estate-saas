"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { SYSTEM_SETTINGS } from "../../graphql/admin/queries/admin.queries";
import { UPDATE_SYSTEM_SETTING, DELETE_SYSTEM_SETTING } from "../../graphql/admin/mutations/admin.mutations";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminGuard from "../../components/admin/AdminGuard";

interface SettingItem {
  key: string;
  value: string;
  category: string;
  description?: string;
  updatedAt?: string;
}

const CATEGORIES = [
  { id: "general", label: "General", icon: "⚙️", description: "Basic platform configuration" },
  { id: "security", label: "Security", icon: "🔒", description: "Authentication and access control" },
  { id: "notifications", label: "Notifications", icon: "🔔", description: "Email and push notification settings" },
  { id: "appearance", label: "Appearance", icon: "🎨", description: "Branding and visual customization" },
  { id: "integrations", label: "Integrations", icon: "🔗", description: "Third-party service connections" },
];

const DEFAULT_SETTINGS: Record<string, SettingItem[]> = {
  general: [
    { key: "site_name", value: "Minshuku SaaS", category: "general", description: "Application name displayed across the platform" },
    { key: "site_url", value: "http://localhost:3000", category: "general", description: "Base URL of the application" },
    { key: "support_email", value: "support@minshuku.com", category: "general", description: "Support contact email" },
    { key: "max_upload_size", value: "10", category: "general", description: "Maximum file upload size in MB" },
  ],
  security: [
    { key: "session_timeout", value: "60", category: "security", description: "Session timeout in minutes" },
    { key: "max_login_attempts", value: "5", category: "security", description: "Max failed login attempts before lockout" },
    { key: "lockout_duration", value: "15", category: "security", description: "Account lockout duration in minutes" },
    { key: "require_2fa", value: "false", category: "security", description: "Require two-factor authentication for admins" },
  ],
  notifications: [
    { key: "email_notifications", value: "true", category: "notifications", description: "Enable email notifications" },
    { key: "booking_notifications", value: "true", category: "notifications", description: "Notify admins of new bookings" },
  ],
  appearance: [
    { key: "primary_color", value: "#3B82F6", category: "appearance", description: "Primary brand color" },
    { key: "logo_url", value: "", category: "appearance", description: "Custom logo URL" },
  ],
  integrations: [
    { key: "google_maps_key", value: "", category: "integrations", description: "Google Maps API key" },
    { key: "stripe_key", value: "", category: "integrations", description: "Stripe publishable key" },
  ],
};

const CATEGORY_COLORS: Record<string, string> = {
  general: "bg-blue-50 text-blue-600",
  security: "bg-red-50 text-red-600",
  notifications: "bg-amber-50 text-amber-600",
  appearance: "bg-purple-50 text-purple-600",
  integrations: "bg-green-50 text-green-600",
};

function isBooleanKey(key: string): boolean {
  return key.startsWith("require_") || key.includes("notifications") || key.includes("_enabled");
}

function isColorKey(key: string): boolean {
  return key.includes("color") || key.includes("Color");
}

function isSecretKey(key: string): boolean {
  return key.includes("key") || key.includes("secret") || key.includes("token");
}

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
  const [search, setSearch] = useState("");
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

  const settings: SettingItem[] = data?.systemSettings ?? [];

  const filteredSettings = useMemo(() => {
    if (!search) return settings;
    const q = search.toLowerCase();
    return settings.filter((s) =>
      s.key.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q) ||
      s.value.toLowerCase().includes(q)
    );
  }, [settings, search]);

  const settingsWithDefaults = useMemo(() => {
    if (filteredSettings.length > 0) return filteredSettings;
    const defaults = DEFAULT_SETTINGS[activeCategory] ?? [];
    if (search) {
      const q = search.toLowerCase();
      return defaults.filter((s) =>
        s.key.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
      );
    }
    return defaults;
  }, [filteredSettings, activeCategory, search]);

  const handleUpdate = async (key: string, value: string) => {
    setMsg("");
    await updateSetting({ variables: { input: { key, value, category: activeCategory } } });
    setEditingKey(null);
  };

  const handleToggle = async (key: string, currentValue: string) => {
    const newValue = currentValue === "true" ? "false" : "true";
    await handleUpdate(key, newValue);
  };

  const handleDelete = async (key: string) => {
    if (confirm(`Delete setting "${key}"?`)) {
      setMsg("");
      await deleteSetting({ variables: { key } });
    }
  };

  const handleSeedDefaults = async () => {
    const defaults = DEFAULT_SETTINGS[activeCategory] ?? [];
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

  if (loading) return <AdminLayout><LoadingSkeleton /></AdminLayout>;
  if (error) return <AdminLayout><p className="text-red-500">Error: {error.message}</p></AdminLayout>;

  const catInfo = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">System Settings</h1>
          <p className="text-sm text-gray-500">{settings.length} configured settings</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {showAddForm ? "Cancel" : "+ Add Setting"}
        </button>
      </div>

      {/* Message */}
      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          msg.includes("deleted") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
        }`}>
          {msg}
        </div>
      )}

      {/* Category Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); setMsg(""); setSearch(""); }}
            className={`p-4 rounded-xl text-left transition-all ${
              activeCategory === cat.id
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-600 border hover:border-blue-300 hover:shadow-sm"
            }`}
          >
            <div className="text-2xl mb-2">{cat.icon}</div>
            <div className="font-semibold text-sm">{cat.label}</div>
            <div className={`text-xs mt-1 ${activeCategory === cat.id ? "text-blue-100" : "text-gray-400"}`}>
              {cat.description}
            </div>
          </button>
        ))}
      </div>

      {/* Search & Actions */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search settings..."
          className="flex-1 min-w-[200px] border rounded-lg px-4 py-2 text-sm"
        />
        <button
          onClick={handleSeedDefaults}
          className="text-sm text-blue-600 hover:text-blue-800 px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Seed defaults
        </button>
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
                className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm font-mono"
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
              placeholder="What does this setting control?"
            />
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
            Save Setting
          </button>
        </form>
      )}

      {/* Settings List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-3 border-b bg-gray-50 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">
            {catInfo?.icon} {catInfo?.label} — {settingsWithDefaults.length} setting(s)
          </span>
        </div>

        {settingsWithDefaults.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📭</div>
            <p>No settings in this category.</p>
            <button
              onClick={handleSeedDefaults}
              className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Seed default settings
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {settingsWithDefaults.map((s: SettingItem) => {
              const isEditing = editingKey === s.key;
              const isBool = isBooleanKey(s.key);
              const isColor = isColorKey(s.key);
              const isSecret = isSecretKey(s.key);
              const isDefault = !settings.find((db) => db.key === s.key);

              return (
                <div key={s.key} className={`px-6 py-4 hover:bg-gray-50 ${isDefault ? "bg-blue-50/30" : ""}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium text-gray-800">{s.key}</span>
                        {isDefault && (
                          <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">default</span>
                        )}
                        {isSecret && (
                          <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded">secret</span>
                        )}
                      </div>
                      {s.description && (
                        <p className="text-xs text-gray-500 mt-1">{s.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          {isColor ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="h-8 w-12 rounded border cursor-pointer"
                              />
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="border rounded px-2 py-1 text-sm w-24 font-mono"
                              />
                            </div>
                          ) : (
                            <input
                              type={isSecret ? "password" : "text"}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="border rounded px-2 py-1 text-sm w-48"
                            />
                          )}
                          <button
                            onClick={() => handleUpdate(s.key, editValue)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
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
                      ) : isBool ? (
                        <button
                          onClick={() => handleToggle(s.key, s.value)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            s.value === "true" ? "bg-green-500" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              s.value === "true" ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      ) : (
                        <span className="text-sm text-gray-700 font-mono max-w-[200px] truncate">
                          {isSecret && s.value ? "••••••••" : s.value || "—"}
                        </span>
                      )}

                      {!isEditing && !isBool && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => { setEditingKey(s.key); setEditValue(s.value); }}
                            className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded hover:bg-blue-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(s.key)}
                            className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function LoadingSkeleton() {
  return (
    <AdminLayout>
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4">
              <div className="h-8 w-8 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-20 mb-1" />
              <div className="h-3 bg-gray-200 rounded w-32" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                <div className="h-3 bg-gray-200 rounded w-48" />
              </div>
              <div className="h-6 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
