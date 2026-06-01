//
// infrastructure/persistence/listing.repository.ts

import { injectable } from "tsyringe";
import { IListingRepository } from "../../../domain/repositories/listing.repository";
import { ListingMapper } from "@/subgraphs/listing/infrastructure/mappers/listing.mapper";

@injectable()
export class ListingRepository implements IListingRepository {
  constructor(
    private model: any
  ) { }
async findById(id: string) {

  const listing =
    await this.model.findByPk(id, {

      include: {
        all: true
      }
    });

  console.log(
    "listing",
    JSON.stringify(
      listing,
      null,
      2
    )
  );

  if (!listing) {
    return null;
  }

  return ListingMapper
    .toDomain(listing);
}
}