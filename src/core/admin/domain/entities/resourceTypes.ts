export const ResourceTypes = [
  "BOOKING",
  "LISTING",
  "PAYMENT",
  "USER",
  "OWNER",
  "TENANT",
  "AUTH",
  "REVIEW",
] as const;

export type ResourceType = typeof ResourceTypes[number];