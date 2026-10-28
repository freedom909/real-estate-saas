"use client";

import { useTenantStore, Tenant } from "../store/tenant.store";
import { switchTenant as switchTenantApi } from "../services/tenant.service";
import { useApolloClient } from "@apollo/client/react";
import { useState } from "react";

export default function TenantSwitcher({ dark = false }: { dark?: boolean }) {
  const { activeTenantId, availableTenants, setActiveTenant } = useTenantStore();
  const client = useApolloClient();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeTenant = availableTenants.find((t) => t.id === activeTenantId);

  const handleSwitch = async (tenant: Tenant) => {
    if (tenant.id === activeTenantId) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await switchTenantApi(tenant.id);
      setActiveTenant(tenant.id);
      // Refresh all active queries so tenant-scoped data updates immediately
      client.refetchQueries({ include: "active" }).catch((e) =>
        console.error("Failed to refresh queries after tenant switch:", e)
      );
      setIsOpen(false);
    } catch (err: any) {
      console.error("Failed to switch tenant:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (availableTenants.length <= 1) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-2 py-1 text-sm rounded-lg transition-colors ${
          dark ? "text-white hover:bg-gray-700" : "border hover:bg-gray-50"
        }`}
        disabled={loading}
      >
        <span className="font-medium">
          {loading ? "Switching..." : activeTenant?.name || "Select Tenant"}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {error && (
        <div className={`absolute right-0 mt-1 px-3 py-2 text-xs rounded-lg whitespace-nowrap border ${dark ? "text-red-300 bg-red-900/40 border-red-800" : "text-red-600 bg-red-50 border-red-200"}`}>
          {error}
        </div>
      )}

      {isOpen && (
        <div className={`absolute right-0 mt-1 w-56 rounded-lg shadow-lg z-50 border ${
          dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}>
          {availableTenants.map((tenant) => (
            <button
              key={tenant.id}
              onClick={() => handleSwitch(tenant)}
              disabled={loading}
              className={`w-full text-left px-4 py-2 text-sm ${dark ? "hover:bg-gray-700" : "hover:bg-gray-50"} ${
                tenant.id === activeTenantId ? (dark ? "bg-gray-700 text-blue-300" : "bg-blue-50 text-blue-700") : ""
              } ${loading ? "opacity-50" : ""}`}
            >
              {tenant.name}
              {tenant.id === activeTenantId && (
                <span className={`ml-2 text-xs ${dark ? "text-blue-300" : "text-blue-500"}`}>(active)</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
