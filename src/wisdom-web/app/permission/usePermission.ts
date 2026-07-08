// src/wisdom-web/app/permission/usePermission.ts
import { hasPermission } from "./hasPermission";

import { useAuthStore } from "../store/auth.store";
import { ROLE_PERMISSIONS } from "../permission/permission";

export const usePermission = () => {
  const user = useAuthStore((s) => s.user);

  const can = (permission: string) => {
    if (!user) return false;
    const role = user.role;
    return hasPermission(role, permission);
  };

  return { can };
};