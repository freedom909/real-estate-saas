// src/wisdom-web/app/types/listing.ts
export interface Listing {
  id: number;
  tenantId: number;
  name: string;
  description: string;
  ownerId: number;
  price: number;
  status: "active" | "inactive";
  createdAt: Date;
}