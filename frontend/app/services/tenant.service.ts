import { useAuthStore } from "../store/auth.store";

const API_BASE = "http://localhost:4000/api/tenants";

function getAuthHeaders(): HeadersInit {
  const token = useAuthStore.getState().accessToken;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export interface SwitchTenantResponse {
  tenant: Tenant;
  activeTenantId: string;
}

/**
 * GET /api/tenants/available
 * Returns all tenants the current user has access to.
 */
export async function getAvailableTenants(): Promise<Tenant[]> {
  const res = await fetch(`${API_BASE}/available`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch tenants: ${res.statusText}`);
  }

  const data = await res.json();
  return data.tenants;
}

/**
 * GET /api/tenants/active
 * Returns the currently active tenant ID.
 */
export async function getActiveTenant(): Promise<string | null> {
  const res = await fetch(`${API_BASE}/active`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch active tenant: ${res.statusText}`);
  }

  const data = await res.json();
  return data.activeTenantId;
}

/**
 * POST /api/tenants/switch
 * Switches the active tenant for the current user.
 */
export async function switchTenant(tenantId: string): Promise<SwitchTenantResponse> {
  const res = await fetch(`${API_BASE}/switch`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ tenantId }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || "Failed to switch tenant");
  }

  return res.json();
}
