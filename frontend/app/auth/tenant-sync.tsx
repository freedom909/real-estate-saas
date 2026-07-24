"use client";

import { useEffect } from "react";
import { useAuthStore } from "../store/auth.store";
import { useTenantStore } from "../store/tenant.store";
import {
  getAvailableTenants,
  getActiveTenant,
} from "../services/tenant.service";

/**
 * Syncs available tenants and auto-selects if user belongs to only one.
 * Runs after auth is established.
 */
export default function TenantSync() {
  const user = useAuthStore((s) => s.user);
  const {
    activeTenantId,
    setAvailableTenants,
    setActiveTenant,
  } = useTenantStore();

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    async function sync() {
      try {
        // Fetch available tenants
        const tenants = await getAvailableTenants();
        if (cancelled) return;

        setAvailableTenants(tenants);

        // Fetch currently active tenant from session
        const activeId = await getActiveTenant();
        if (cancelled) return;

        if (activeId) {
          // Session has an active tenant — use it
          setActiveTenant(activeId);
        } else if (tenants.length === 1 && !activeTenantId) {
          // No active tenant in session, but only 1 available — auto-select
          setActiveTenant(tenants[0].id);
        }
      } catch (err) {
        console.error("Failed to sync tenants:", err);
      }
    }

    sync();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return null;
}
