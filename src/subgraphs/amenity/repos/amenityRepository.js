import { Op } from 'sequelize';
import Amenity from '../models/mysql/amenity.js';
import ListingAmenities from '../models/mysql/listingAmenities.js';

export default class AmenityRepository {
  constructor({ sequelize }) {
    this.sequelize = sequelize;
  }

  async findAmenitiesByName(names) {
    return await Amenity.findAll({
      where: { name: { [Op.in]: names } },
      attributes: ['id', 'name', 'categoryId', 'description', 'locationId'],
    });
  }

  async createAmenity({ name, categoryId, description, locationId }) {
    return await Amenity.create({ name, categoryId, description, locationId });
  }

  async findAllAmenities() {
    return await Amenity.findAll({
      include: ['category'],
    });
  }

  async bulkCreateListingAmenities(listingAmenities) {
    return await ListingAmenities.bulkCreate(listingAmenities, {
      ignoreDuplicates: true,
    });
  }

  async findAmenityById(id) {
    return await Amenity.findByPk(id, { include: ['category'] });
  }
}
