// models/mysql/associations.js
import Listing from './listing.js';
import Location from './location.js';
import Amenity from './amenity.js';
import Category from './category.js';
import ListingAmenities from './listingAmenities.js';
import ListingCategories from './listingCategories.js';
import ListingLocations from './listingLocations.js'; // new join table

export function setupAssociations() {
  // ========================
  // Listing ↔ Locations (many-to-many)
  // ========================
  Listing.belongsToMany(Location, {
    through: ListingLocations,
    foreignKey: 'listingId',
    otherKey: 'locationId',
  });
  Location.belongsToMany(Listing, {
    through: ListingLocations,
    foreignKey: 'locationId',
    otherKey: 'listingId',
  });

  // ========================
  // Listing ↔ Amenities (many-to-many)
  // ========================
  Listing.belongsToMany(Amenity, {
    through: ListingAmenities,
    foreignKey: 'listingId',
    otherKey: 'amenityId',
  });
  Amenity.belongsToMany(Listing, {
    through: ListingAmenities,
    foreignKey: 'amenityId',
    otherKey: 'listingId',
  });

  // ========================
  // Listing ↔ Categories (many-to-many)
  // ========================
  Listing.belongsToMany(Category, {
    through: ListingCategories,
    foreignKey: 'listingId',
    otherKey: 'categoryId',
  });
  Category.belongsToMany(Listing, {
    through: ListingCategories,
    foreignKey: 'categoryId',
    otherKey: 'listingId',
  });
}
