// src/wisdom-web/app/permission/hasPermission.ts

import { ROLE_PERMISSIONS } from "./permission";

export function hasPermission(
  userRole: keyof typeof ROLE_PERMISSIONS,
  permission: string
) {
  return ROLE_PERMISSIONS[userRole]?.includes(permission);
}
