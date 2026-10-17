//frontend/app/store/tenant.store.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  membershipRole: string | null;
}

interface TenantState {
  activeTenantId: string | null;
  availableTenants: Tenant[];
  isLoading: boolean;
  hasSynced: boolean;
  setActiveTenant: (tenantId: string) => void;
  setAvailableTenants: (tenants: Tenant[]) => void;
  setIsLoading: (loading: boolean) => void;
  setHasSynced: (value: boolean) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      activeTenantId: null,
      availableTenants: [],
      isLoading: false,
      hasSynced: false,

      setActiveTenant: (tenantId) =>
        set({ activeTenantId: tenantId }),

      setAvailableTenants: (tenants) =>
        set({ availableTenants: tenants }),

      setIsLoading: (loading) =>
        set({ isLoading: loading }),

      setHasSynced: (value) =>
        set({ hasSynced: value }),

      clearTenant: () =>
        set({
          activeTenantId: null,
          availableTenants: [],
          isLoading: false,
          hasSynced: false,
        }),
    }),
    {
      name: "tenant-storage",

      // 不持久化 hasSynced，刷新页面后必须重新同步。
      partialize: (state) => ({
        activeTenantId: state.activeTenantId,
        availableTenants: state.availableTenants,
        isLoading: state.isLoading,
      }),
    }
  )
);
