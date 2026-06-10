export const TOKENS_LISTING = {
  listingModel: Symbol.for("ListingModel"),

  listingClient: Symbol.for("Listing.ListingClient"),
  
  sequelize: Symbol.for('Sequelize'),
  listing: Symbol.for('Listing'),

  listingCategories: Symbol.for('ListingCategories'),
  listingCategoriesModel: Symbol.for('ListingCategoriesModelModel'),
  listingAmenity: Symbol.for('ListingAmenity'),
  listingAmenityModel: Symbol.for('ListingAmenityModel'),
  listingLocations: Symbol.for('ListingLocations'),
  listingLocationsModel: Symbol.for('ListingLocationsModel'),
 
  repos:{
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
    getListingUseCase: Symbol.for('GetListingUseCase'),
    updateListingUseCase: Symbol.for('UpdateListingUseCase'),
    geleteListingUseCase: Symbol.for('DeleteListingUseCase'),
  },

    adapters: {
    hostAdapter: Symbol.for("Listing.adapters.hostAdapter"),
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


