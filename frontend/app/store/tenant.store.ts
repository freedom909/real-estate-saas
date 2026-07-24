import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
}

interface TenantState {
  activeTenantId: string | null;
  availableTenants: Tenant[];
  isLoading: boolean;
  setActiveTenant: (tenantId: string) => void;
  setAvailableTenants: (tenants: Tenant[]) => void;
  setIsLoading: (loading: boolean) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      activeTenantId: null,
      availableTenants: [],
      isLoading: false,
      setActiveTenant: (tenantId) => set({ activeTenantId: tenantId }),
      setAvailableTenants: (tenants) => set({ availableTenants: tenants }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      clearTenant: () => set({ activeTenantId: null, availableTenants: [], isLoading: false }),
    }),
    {
      name: "tenant-storage",
    }
  )
);
