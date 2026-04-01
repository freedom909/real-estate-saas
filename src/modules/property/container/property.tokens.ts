export const TOKENS_PROPERTY = {
    propertyModel: Symbol.for("property.models.propertyModel"),
    propertyService: Symbol.for("property.services.propertyService"),
    propertyRepo: Symbol.for("property.repos.propertyRepo"),
    propertyClient: Symbol.for("property.propertyClient"),
    
    tenantAdapter: Symbol.for("property.adapters.tenantAdapter"),
} as const;


