"use client";

import { useTenantStore, Tenant } from "../store/tenant.store";
import { switchTenant as switchTenantApi } from "../services/tenant.service";
import { useState } from "react";

export default function TenantSwitcher() {
  const { activeTenantId, availableTenants, setActiveTenant } = useTenantStore();
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
        className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
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
        <div className="absolute right-0 mt-1 px-3 py-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg whitespace-nowrap">
          {error}
        </div>
      )}

      {isOpen && (
        <div className="absolute right-0 mt-1 w-56 bg-white border rounded-lg shadow-lg z-50">
          {availableTenants.map((tenant) => (
            <button
              key={tenant.id}
              onClick={() => handleSwitch(tenant)}
              disabled={loading}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                tenant.id === activeTenantId ? "bg-blue-50 text-blue-700" : ""
              } ${loading ? "opacity-50" : ""}`}
            >
              {tenant.name}
              {tenant.id === activeTenantId && (
                <span className="ml-2 text-xs text-blue-500">(active)</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
