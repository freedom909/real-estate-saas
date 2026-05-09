export const TOKENS_LISTING = {
    ListingModel: Symbol.for("ListingModel"),
    ListingService: Symbol.for("Listing.services.ListingService"),
    ListingClient: Symbol.for("Listing.ListingClient"),   
    ListingRepository: Symbol.for('ListingRepository'),
    CreateListingUseCase: Symbol.for('CreateListingUseCase'),
    GetListingUseCase: Symbol.for('GetListingUseCase'),
    Sequelize: Symbol.for('Sequelize'),
    Listing: Symbol.for('Listing'),
    ApplyTitleSuggestionUseCase: Symbol.for('ApplyTitleSuggestionUseCase'),
    ApplyDescriptionSuggestionUseCase: Symbol.for('ApplyDescriptionSuggestionUseCase'),
    ListingCategories: Symbol.for('ListingCategories'),
    ListingCategoriesModel: Symbol.for('ListingCategoriesModelModel'),
    ListingAmenity: Symbol.for('ListingAmenity'),
    ListingAmenityModel: Symbol.for('ListingAmenityModel'),
    ListingLocations: Symbol.for('ListingLocations'),
    ListingLocationsModel: Symbol.for('ListingLocationsModel'),

    adapters: {
        hostAdapter: Symbol.for("Listing.adapters.hostAdapter"),
        locationAdapter: Symbol.for("Listing.adapters.locationAdapter"),
        amenityAdapter: Symbol.for("Listing.adapters.AmenityAdapter"),
        categoryAdapter: Symbol.for("Listing.adapters.categoryAdapter"),
    }
} as const;


