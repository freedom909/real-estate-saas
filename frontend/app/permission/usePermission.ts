// src/wisdom-web/app/permission/usePermission.ts
import { hasPermission } from "./hasPermission";

import { useAuthStore } from "../store/auth.store";
import { ROLE_PERMISSIONS } from "./permission";
import { Role } from "./role";
import { useTenantStore } from "../store/tenant.store";

export const usePermission = () => {
  const user = useAuthStore((s) => s.user);
    const activeTenantId = useTenantStore(
    (s) => s.activeTenantId
  );

    const availableTenants = useTenantStore(
    (s) => s.availableTenants
  );

    const activeTenant = availableTenants.find(
    (tenant) => tenant.id === activeTenantId
  );

   const membershipRole = activeTenant?.membershipRole;
   
const can = (permission: string) => {
    if (!user) return false;

    const globalRole = user.role as Role;

    // Global roles
    if (
      globalRole === Role.ADMIN ||
      globalRole === Role.SUPER_ADMIN
    ) {
      return hasPermission(globalRole, permission);
    }

    // Tenant membership roles
    if (!membershipRole) {
      return false;
    }

    return hasPermission(
      membershipRole as Role,
      permission
    );
  };
 
  return { can };
};