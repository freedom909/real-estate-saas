import { UserRole } from "../userRole";



export function normalizeRole(role: UserRole): string {
  // Normalize role to standard format
  if (!role) return;
  
  // Convert to uppercase and remove spaces
  return role.toUpperCase().trim().replace(/\s+/g, "_");
}