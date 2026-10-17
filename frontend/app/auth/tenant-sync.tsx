//src/auth/tenant-sync.tsx


"use client";

import { useEffect } from "react";
import { useAuthStore } from "../store/auth.store";
import { useTenantStore } from "../store/tenant.store";
import {
  getAvailableTenants,
  getActiveTenant,
} from "../services/tenant.service";

export default function TenantSync() {
  const userId = useAuthStore((s) => s.user?.id);

  const {
    activeTenantId,
    setAvailableTenants,
    setActiveTenant,
    setIsLoading,
    setHasSynced,
  } = useTenantStore();

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      if (!userId) {
        setIsLoading(false);
        setHasSynced(true);
        return;
      }

      setIsLoading(true);
      setHasSynced(false);

      try {
        const tenants = await getAvailableTenants();
        if (cancelled) return;

        setAvailableTenants(tenants);

        const activeId = await getActiveTenant();
        if (cancelled) return;

        if (activeId && tenants.some((t) => t.id === activeId)) {
          setActiveTenant(activeId);
        } else if (
          activeTenantId &&
          tenants.some((t) => t.id === activeTenantId)
        ) {
          // 保留仍然有效的本地租户选择。
        } else if (tenants.length === 1) {
          setActiveTenant(tenants[0].id);
        } else {
          console.warn(
            "[TenantSync] No valid active tenant selected."
          );
        }

        console.log("[TenantSync] available tenants:", tenants);
      } catch (err) {
        if (!cancelled) {
          console.error("[TenantSync] Failed to sync tenants:", err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setHasSynced(true);
        }
      }
    }

    sync();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return null;
}
