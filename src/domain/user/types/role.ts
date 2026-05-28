export enum Role {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  OWNER = 'OWNER',
  CUSTOMER = 'CUSTOMER',
  USER = "USER",
}

export function normalizeRole(role: string): string {
  // Normalize role to standard format
  if (!role) return "USER";
  
  // Convert to uppercase and remove spaces
  return role.toUpperCase().trim().replace(/\s+/g, "_");
}