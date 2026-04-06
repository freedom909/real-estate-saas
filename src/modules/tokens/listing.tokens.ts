export const TOKENS_LISTING = {
    ListingModel: Symbol.for("Listing.models.ListingModel"),
    ListingService: Symbol.for("Listing.services.ListingService"),
    ListingClient: Symbol.for("Listing.ListingClient"),
    tenantAdapter: Symbol.for("Listing.adapters.tenantAdapter"),
    ListingRepository: Symbol.for('ListingRepository'),
    CreateListingUseCase: Symbol.for('CreateListingUseCase'),
    GetListingUseCase: Symbol.for('GetListingUseCase'),
    AmenityAdapter: Symbol.for('AmenityAdapter'),
    Sequelize: Symbol.for('Sequelize'),
} as const;


