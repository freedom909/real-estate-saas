// frontend/app/lib/createSlug.ts

/**
 * URL-safe slug generated from a human-readable name.
 * Shared by tenant creation flows (account/tenants/new, account Become-a-Host banner).
 */
export function createSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
