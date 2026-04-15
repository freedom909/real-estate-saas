// This is a conceptual model for a MySQL database.
// In a real application, you would use an ORM like TypeORM or Sequelize.
// For TypeORM, this would be an Entity class with decorators.

export interface ListingModelAttributes {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

// If using TypeORM, this would be:
// @Entity('listings')
// export class ListingModel implements ListingModelAttributes { ... }
// For this example, we'll treat it as a simple interface for the repository.
export type ListingModel = ListingModelAttributes;