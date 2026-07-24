import { Role } from "@/core/shared/domain/role";

export interface OperationAuthRequirement {
  /** If true, user must be authenticated */
  authenticated: boolean;
  /** If set, user must have at least this role */
  minRole?: Role;
  /** If set, specific permissions required (checked via policy engine) */
  permissions?: string[];
}

/**
 * Central registry of auth requirements per GraphQL operation.
 *
 * Convention: operation name = Query/Mutation field name.
 * If an operation is NOT listed here, it is PUBLIC (no auth required).
 */
const AUTH_MAP: Record<string, OperationAuthRequirement> = {
  // ========== Admin Subgraph ==========
  adminUsers:              { authenticated: true, minRole: Role.ADMIN },
  adminUser:               { authenticated: true, minRole: Role.ADMIN },
  adminAuditLogs:          { authenticated: true, minRole: Role.STAFF },
  adminAuditLogCount:      { authenticated: true, minRole: Role.STAFF },
  adminDashboard:          { authenticated: true, minRole: Role.ADMIN },
  dashboardStats:          { authenticated: true, minRole: Role.ADMIN },
  systemSettings:          { authenticated: true, minRole: Role.ADMIN },
  myPermissions:           { authenticated: true, minRole: Role.STAFF },
  notifications:           { authenticated: true, minRole: Role.STAFF },
  unreadNotificationCount: { authenticated: true, minRole: Role.STAFF },
  createAdminUser:         { authenticated: true, minRole: Role.ADMIN, permissions: ["admin_users:create"] },
  updateAdminUser:         { authenticated: true, minRole: Role.ADMIN, permissions: ["admin_users:update"] },
  deleteAdminUser:         { authenticated: true, minRole: Role.SUPER_ADMIN, permissions: ["admin_users:delete"] },
  createAdminAuditLog:     { authenticated: true, minRole: Role.ADMIN },
  updateAdminAccount:      { authenticated: true, minRole: Role.STAFF },
  updateSystemSetting:     { authenticated: true, minRole: Role.ADMIN, permissions: ["settings:update"] },
  deleteSystemSetting:     { authenticated: true, minRole: Role.SUPER_ADMIN, permissions: ["settings:delete"] },
  createNotification:      { authenticated: true, minRole: Role.ADMIN },
  markNotificationRead:    { authenticated: true, minRole: Role.STAFF },
  markAllNotificationsRead:{ authenticated: true, minRole: Role.STAFF },
  deleteNotification:      { authenticated: true, minRole: Role.STAFF },

  // ========== Booking Subgraph ==========
  booking:                  { authenticated: true, minRole: Role.CUSTOMER },
  bookingsForTenant:        { authenticated: true, minRole: Role.OWNER },
  bookingsForCustomer:      { authenticated: true, minRole: Role.CUSTOMER },
  myBookings:               { authenticated: true, minRole: Role.CUSTOMER },
  currentCustomerBooking:   { authenticated: true, minRole: Role.CUSTOMER },
  upcomingCustomerBookings: { authenticated: true, minRole: Role.CUSTOMER },
  pastCustomerBookings:     { authenticated: true, minRole: Role.CUSTOMER },
  customerBookings:         { authenticated: true, minRole: Role.CUSTOMER },
  createBooking:            { authenticated: true, minRole: Role.CUSTOMER },
  cancelBooking:            { authenticated: true, minRole: Role.CUSTOMER },
  confirmBooking:           { authenticated: true, minRole: Role.OWNER },
  checkInBooking:           { authenticated: true, minRole: Role.OWNER },
  completeBooking:          { authenticated: true, minRole: Role.OWNER },
  updateBooking:            { authenticated: true, minRole: Role.OWNER },
  analyzeBookingFraud:      { authenticated: true, minRole: Role.ADMIN },

  // ========== Payment Subgraph ==========
  paymentByBooking:  { authenticated: true, minRole: Role.CUSTOMER },
  payment:           { authenticated: true, minRole: Role.CUSTOMER },
  paymentsByCustomer:{ authenticated: true, minRole: Role.CUSTOMER },
  createPayment:     { authenticated: true, minRole: Role.CUSTOMER },
  processPayment:    { authenticated: true, minRole: Role.CUSTOMER },
  processRefund:     { authenticated: true, minRole: Role.OWNER },
  cancelPayment:     { authenticated: true, minRole: Role.CUSTOMER },
  confirmPayment:    { authenticated: true, minRole: Role.OWNER },
  failPayment:       { authenticated: true, minRole: Role.ADMIN },

  // ========== Review Subgraph ==========
  review:                       { authenticated: false },
  reviewsByListing:             { authenticated: false },
  submitCustomerReview:         { authenticated: true, minRole: Role.CUSTOMER },
  submitOwnerReplyToCustomerReview: { authenticated: true, minRole: Role.OWNER },
  updateReview:                 { authenticated: true, minRole: Role.CUSTOMER },
  deleteReview:                 { authenticated: true, minRole: Role.ADMIN },

  // ========== Auth Subgraph ==========
  oauthLogin:    { authenticated: false },
  refreshToken:  { authenticated: false },
  logout:        { authenticated: true, minRole: Role.GUEST },
  me:            { authenticated: true, minRole: Role.GUEST },
};

export function getOperationAuth(operationName: string): OperationAuthRequirement | null {
  return AUTH_MAP[operationName] ?? null;
}
