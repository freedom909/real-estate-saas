import { GlobalRole } from "@/core/shared/domain/role";

export function requireGlobalRole(value: unknown): GlobalRole {
  if (
    typeof value !== "string" ||
    !Object.values(GlobalRole).includes(value as GlobalRole)
  ) {
    throw new Error("Invalid or missing global role");
  }

  return value as GlobalRole;
}
