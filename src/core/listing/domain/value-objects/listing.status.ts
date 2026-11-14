// src/core/listing/domain/value-objects/listing.status.ts
// --------------------------------------------------
// 1. 定义列表状态枚举
// --------------------------------------------------
// src/core/listing/domain/enums/listing-status.ts

export enum ListingStatus {
  DRAFT = "DRAFT",
  
  PUBLISHED = "PUBLISHED",
  UNPUBLISHED = "UNPUBLISHED",
  SUSPENDED = "SUSPENDED",
  PENDING_REVIEW = "PENDING_REVIEW",
}