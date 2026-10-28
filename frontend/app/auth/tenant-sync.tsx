//src/auth/tenant-sync.tsx


"use client";

import { useEffect } from "react";
import { useAuthStore } from "../store/auth.store";
import { useTenantStore } from "../store/tenant.store";
import {
  getAvailableTenants,
  getActiveTenant,
  switchTenant,
} from "../services/tenant.service";

export default function TenantSync() {
  const userId = useAuthStore((s) => s.user?.id);

  const {
    // activeTenantId intentionally not destructured — read via getState() in the effect (stale-closure safe)
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
        const localActiveId = useTenantStore.getState().activeTenantId;
        if (cancelled) return;

        if (activeId && tenants.some((t) => t.id === activeId)) {
          setActiveTenant(activeId);
        } else if (
          localActiveId &&
          tenants.some((t) => t.id === localActiveId)
        ) {
          // ローカルの選択をセッションに永続化する（ゲートウェイ/サブグラフが参照できるように）。
          setActiveTenant(localActiveId);
          await switchTenant(localActiveId).catch((e) =>
            console.warn("[TenantSync] Failed to persist active tenant:", e)
          );
        } else if (tenants.length > 0) {
          // 初回ログイン等でセッションにテナントがない場合は最初のテナントを自動選択する。
          setActiveTenant(tenants[0].id);
          await switchTenant(tenants[0].id).catch((e) =>
            console.warn("[TenantSync] Failed to persist active tenant:", e)
          );
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
