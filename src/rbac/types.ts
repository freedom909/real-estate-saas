export enum Action {
  READ = "READ",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  CONFIRM = "CONFIRM",
  CANCEL = "CANCEL",
  CHECK_IN = "CHECK_IN",
  CHECK_OUT = "CHECK_OUT",
  COMPLETE = "COMPLETE",
    // Listing management
  PUBLISH = "PUBLISH",
  UNPUBLISH = "UNPUBLISH",
  SUSPEND = "SUSPEND",
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