export const TOKENS_Listing = {
    ListingModel: Symbol.for("Listing.models.ListingModel"),
    ListingService: Symbol.for("Listing.services.ListingService"),
    ListingRepo: Symbol.for("Listing.repos.ListingRepo"),
    ListingClient: Symbol.for("Listing.ListingClient"),
    
    tenantAdapter: Symbol.for("Listing.adapters.tenantAdapter"),
} as const;


