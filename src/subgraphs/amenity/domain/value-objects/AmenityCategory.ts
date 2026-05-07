// domain/value-objects/AmenityCategory.ts

export enum AmenityCategory {
  ACCOMMODATION_DETAILS = "ACCOMMODATION_DETAILS",
  SPACE_SURVIVAL = "SPACE_SURVIVAL",
  OUTDOORS = "OUTDOORS",
  UNKNOWN = "UNKNOWN",
}

// ✔ 验证函数（很重要）
export function isValidAmenityCategory(value: string): value is AmenityCategory {
  return Object.values(AmenityCategory).includes(value as AmenityCategory);
}