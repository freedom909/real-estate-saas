export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',

  CONFIRM = "confirm",
  CANCEL = "cancel",
  CHECK_IN = "check_in",
  COMPLETE = "complete"
}

export enum Resource {
  LISTING = "Listing",
  BOOKING = "Booking",
  PAYMENT = "Payment",
  REVIEW = "Review",
  Customer = "Customer",
  USER = "USER",
}

export interface SecurityAssessment {
  riskScore: number; // 0 ~ 100
  decision: "ALLOW" | "FLAG" | "CHALLENGE" | "BLOCK";
  reasons: string[];

}