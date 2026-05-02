export const TOKENS_LISTING = {
    ListingModel: Symbol.for("ListingModel"),
    ListingService: Symbol.for("Listing.services.ListingService"),
    ListingClient: Symbol.for("Listing.ListingClient"),
    hostAdapter: Symbol.for("Listing.adapters.hostAdapter"),
    ListingRepository: Symbol.for('ListingRepository'),
    CreateListingUseCase: Symbol.for('CreateListingUseCase'),
    GetListingUseCase: Symbol.for('GetListingUseCase'),
    AmenityAdapter: Symbol.for('AmenityAdapter'),
    Sequelize: Symbol.for('Sequelize'),
    OpenAIAdapter: Symbol.for('OpenAIAdapter'),
    Listing: Symbol.for('Listing'),
    GenerateTitleSuggestionUseCase: Symbol.for('GenerateTitleSuggestionUseCase'),
    GenerateDescriptionSuggestionUseCase: Symbol.for('GenerateDescriptionSuggestionUseCase'),
    ApplyDescriptionSuggestionUseCase: Symbol.for('ApplyDescriptionSuggestionUseCase'),
    ListingCategories: Symbol.for('ListingCategories'),
    ListingCategoriesModel: Symbol.for('ListingCategoriesModelModel'),
    ListingAmenity: Symbol.for('ListingAmenity'),
    ListingAmenityModel: Symbol.for('ListingAmenityModel'),
    ListingLocations: Symbol.for('ListingLocations'),
    ListingLocationsModel: Symbol.for('ListingLocationsModel'),
} as const;


