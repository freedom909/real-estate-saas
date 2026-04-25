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
    OpenAIAdapter: Symbol.for('OpenAIAdapter'),
    Listing: Symbol.for('Listing'),
    GenerateTitleSuggestionUseCase: Symbol.for('GenerateTitleSuggestionUseCase'),
    ApplyTitleSuggestionUseCase: Symbol.for('ApplyTitleSuggestionUseCase'),
    ListingCategories: Symbol.for('ListingCategories'),
    ListingCategoriesModel: Symbol.for('ListingCategories'),
    ListingAmenity: Symbol.for('ListingAmenity'),
    ListingAmenityModel: Symbol.for('ListingAmenityModel'),
    ListingLocations: Symbol.for('ListingLocations'),
    ListingLocationsModel: Symbol.for('ListingLocationsModel'),
} as const;


