// src/wisdom-web/app/permission/hasPermission.ts

import { ROLE_PERMISSIONS } from "./permission";
import { Role } from "./role";

export function hasPermission(role: Role, permission: string): boolean {
return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
//プロパティ 'ADMIN' は型 '{ guest: never[]; host: string[]; admin: string[]; }' に存在していません。'admin' ですか?
}
