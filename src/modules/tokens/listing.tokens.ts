export const TOKENS_LISTING = {
  models: {
    listingModel: Symbol.for("ListingModel"),
    listingCategoriesModel: Symbol.for('ListingCategoriesModelModel'),
    listingLocationsModel: Symbol.for('ListingLocationsModel'),
    listingAmenityModel: Symbol.for('ListingAmenityModel'),
  },


  listingClient: Symbol.for("Listing.ListingClient"),

  sequelize: Symbol.for('Sequelize'),
  listing: Symbol.for('Listing'),

  listingCategories: Symbol.for('ListingCategories'),

  listingAmenity: Symbol.for('ListingAmenity'),

  listingLocations: Symbol.for('ListingLocations'),


  repos: {
    listingRepository: Symbol.for('ListingRepository'),
    listingAISuggestionRepository: Symbol.for("ListingAISuggestionRepository"),
    aiSuggestion: Symbol.for("ListingAISuggestion"),
  },
  usecase: {
    generateListingAIOptimizationUseCase: Symbol.for('GenerateListingAIOptimizationUseCase'),
    generateDescriptionSuggestionUseCase: Symbol.for('GenerateDescriptionSuggestionUseCase'),
    seoAnalysisUseCase: Symbol.for('SEOAnalysisUseCase'),
    priceOptimizationUseCase: Symbol.for('PriceOptimizationUseCase'),
    categoryOptimizationUseCase: Symbol.for('CategoryOptimizationUseCase'),
    applyDescriptionSuggestionUseCase: Symbol.for('ApplyDescriptionSuggestionUseCase'),
    createListingUseCase: Symbol.for('CreateListingUseCase'),
    getListingByIdUseCase: Symbol.for('GetListingByIdUseCase'),
    searchListingUseCase: Symbol.for('SearchListingUseCase'),
    updateListingUseCase: Symbol.for('UpdateListingUseCase'),
    deleteListingUseCase: Symbol.for('DeleteListingUseCase'),
  },

  adapters: {
    ownerAdapter: Symbol.for("Listing.adapters.ownerAdapter"),
    locationAdapter: Symbol.for("Listing.adapters.locationAdapter"),
    amenityAdapter: Symbol.for("Listing.adapters.AmenityAdapter"),
    categoryAdapter: Symbol.for("Listing.adapters.categoryAdapter"),
    titleAdapter: Symbol.for("Listing.adapters.titleAdapter"),
    descriptionAdapter: Symbol.for("Listing.adapters.descriptionAdapter"),
  },
  ai: {
    openAIService: Symbol.for("OpenAIService"),
    openAIAdapter: Symbol.for("OpenAIAdapter"),

    listingAISuggestionModel: Symbol.for("ListingAISuggestionModel"),
  },
  openAIAdapter: Symbol.for("OpenAIAdapter"),
} as const;
