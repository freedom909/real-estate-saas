export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete'
}

export enum Resource {
  
  LISTING = "Listing",
  BOOKING = "Booking",
  Customer = "Customer",
  USER = "USER",
}

export interface SecurityAssessment {
  riskScore: number; // 0 ~ 1
  suggestedAction: "ALLOW" | "FLAG" | "CHALLENGE" | "BLOCK";
  reason?: string;
}