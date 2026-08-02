// Associations between models
import ListingModel from "./listing.model";
import PictureModel from "./picture.model";

export function initAssociations() {
    ListingModel.hasMany(PictureModel, {
        foreignKey: "listingId",
        as: "pictures",
    });

    PictureModel.belongsTo(ListingModel, {
        foreignKey: "listingId",
        as: "listing",
    });
}