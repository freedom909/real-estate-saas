// Associations between models
import { sequelize } from "@/infrastructure/config/seq";
import ListingModel from "./listing.model";
import { PictureModel, initPictureModel } from "./picture.model";

export function initAssociations() {
    // Initialize PictureModel with sequelize before setting up associations
    initPictureModel(sequelize);

    ListingModel.hasMany(PictureModel, {
        foreignKey: "listingId",
        as: "pictures",
    });

    PictureModel.belongsTo(ListingModel, {
        foreignKey: "listingId",
        as: "listing",
    });
}
