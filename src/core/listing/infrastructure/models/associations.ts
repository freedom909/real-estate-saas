// Associations between models
import { sequelize } from "@/infrastructure/config/seq";
import ListingModel from "./listing.model";
import { PictureModel, initPictureModel } from "./picture.model";
import LocationModel from "@/core/location/infrastructure/persistence/location.model";
import CategoryModel from "./category.model";

export function initAssociations() {
    // Initialize PictureModel with sequelize before setting up associations
    

    ListingModel.hasMany(PictureModel, {
        foreignKey: "listingId",
        as: "pictures",
    });
    ListingModel.hasOne(LocationModel, {
        foreignKey: "locationId",
        as: "location",
    });
    
    ListingModel.hasMany(CategoryModel, {
        foreignKey: "listingId",
        as: "categories",
    });
    
    CategoryModel.belongsTo(ListingModel, {
        foreignKey: "listingId",
        as: "listing",
    });
    

}
