//src

export interface ListingSnapshot {
  id: string;

  title?: string;

  description?: string;

  city?: string;

  propertyType?: string;

  amenities?: string[];

  occupancy?: number;
}