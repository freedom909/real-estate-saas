export const TOKENS_ACCOUNT = {
    // --- ACL Clients (HTTP to other subgraphs) ---
    BookingClient: Symbol.for("Account.BookingClient"),
    ListingClient: Symbol.for("Account.ListingClient"),
    ReviewClient: Symbol.for("Account.ReviewClient"),
    TenantClient: Symbol.for("Account.TenantClient"),

    // --- ACL Adapters (domain-normalized view of external data) ---
    BookingACL: Symbol.for("Account.BookingACL"),
    ListingACL: Symbol.for("Account.ListingACL"),
    ReviewACL: Symbol.for("Account.ReviewACL"),
    TenantACL: Symbol.for("Account.TenantACL"),

    // --- Gateways (Apollo Federation @resolveReference) ---
    BookingGateway: Symbol.for("Account.BookingGateway"),
    ListingGateway: Symbol.for("Account.ListingGateway"),
    ReviewGateway: Symbol.for("Account.ReviewGateway"),
    TenantGateway: Symbol.for("Account.TenantGateway"),



    // --- Use Cases ---
    GetMyDashboardUseCase: Symbol.for("Account.GetMyDashboardUseCase"),
    GetOwnerDashboardUseCase: Symbol.for("Account.GetOwnerDashboardUseCase"),
    GetAdminDashboardUseCase: Symbol.for("Account.GetAdminDashboardUseCase"),

    // --- Domain Services (Business Rules) ---
    rules: {
        cancellationPolicy: Symbol.for("Account.CancellationPolicyService"),
        holidayPricing: Symbol.for("Account.HolidayPricingService"),
        cleaningFee: Symbol.for("Account.CleaningFeeRuleService"),
        oversaleCheck: Symbol.for("Account.OversaleCheckService"),
        multiRoomInventory: Symbol.for("Account.MultiRoomInventoryService"),
        couponRule: Symbol.for("Account.CouponRuleService"),
        refundRule: Symbol.for("Account.RefundRuleService"),
        occupancyLimit: Symbol.for("Account.OccupancyLimitService"),
        bookingValidation: Symbol.for("Account.BookingValidationService"),
    },
}
