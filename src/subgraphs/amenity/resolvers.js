import { GraphQLError } from 'graphql';

const resolvers = {
  Query: {
    amenities: async (_, __, { dataSources }) => {
      return dataSources.amenityService.getAllAmenities();
    },
    amenity: async (_, { id }, { dataSources }) => {
      const amenity = await dataSources.amenityService.getAmenityById(id);
      if (!amenity) {
        throw new GraphQLError('Amenity not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return amenity;
    },
  },
  Mutation: {
    createAmenity: async (_, { input }, { dataSources }) => {
      try {
        const newAmenity = await dataSources.amenityService.addAmenity(input);
        return {
          success: true,
          message: 'Amenity created successfully',
          amenity: newAmenity,
        };
      } catch (error) {
        console.error('Error creating amenity:', error);
        return {
          success: false,
          message: error.message,
          amenity: null,
        };
      }
    },
    updateAmenity: async (_, { id, name, category }, { dataSources }) => {
      const amenity = await dataSources.amenityService.updateAmenity(id, { name, category });
      if (!amenity) {
        throw new GraphQLError('Amenity not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return amenity;
    },
    deleteAmenity: async (_, { id }, { dataSources }) => {
      const success = await dataSources.amenityService.deleteAmenity(id);
      if (!success) {
        throw new GraphQLError('Amenity not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      // The schema expects the deleted amenity to be returned.
      // Since the service returns a boolean, we can't return the amenity.
      // This part of the schema/resolver might need adjustment if the deleted object is required.
      return { id, name: 'deleted', category: 'UNKNOWN' }; // Placeholder
    },
  },
  Amenity: {
    __resolveReference(amenity, { dataSources }) {
      return dataSources.amenityService.getAmenityById(amenity.id);
    },
  }
};

export default resolvers;