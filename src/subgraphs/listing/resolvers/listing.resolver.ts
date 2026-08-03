import { container } from "tsyringe";

import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { TOKENS_CATEGORY } from "@/modules/tokens/category.tokens";

import { IListingRepository } from "@/core/listing/domain/entities/IListingRepository";


import GetListingByIdUseCase from "@/core/listing/application/usecase/getListingById.usecase";
import CreateListingUseCase from "@/core/listing/application/usecase/createListing.usecase";

export const resolvers = {

  Query: {

    listings: async () => {

      const repo =
        container.resolve<IListingRepository>(
          TOKENS_LISTING.repos.listingRepository
        );

      const listings =
        await repo.findAll();
      return listings.map(listing => ({

        id: listing.id,
        ownerId: listing.ownerId,
        title:
          listing.title,


        description:
          listing.description,


        address: listing.address,


        price: listing.price,


        numOfBeds: listing.numOfBeds,


        numOfCustomers: listing.numOfCustomers,


        numOfBathrooms: listing.numOfBathrooms,


        numOfRooms: listing.numOfRooms,


        isFeatured: listing.isFeatured,


        pictures:
          listing.pictures.map(pic =>
            pic.toJson()
          )

      }));

    },


    listing: async (
      _: any,
      { id }: { id: string }
    ) => {

      const useCase =
        container.resolve<GetListingByIdUseCase>(
          TOKENS_LISTING.usecase.getListingByIdUseCase
        );


      return useCase.execute(id);

    },

  },

 Mutation: {
    createListing: async ( _: any,{input}:any,{context}:any) => {
console.log("========== CREATE LISTING ==========");
console.log("input.picture =", input.picture);
console.log("picture length =", input.picture?.length);
console.log("context.user =", context.user);
if (!context.user) {
  throw new Error("User not authenticated");
}
      const useCase =
        container.resolve<CreateListingUseCase>(
          TOKENS_LISTING.usecase.createListingUseCase
        );
      return useCase.execute(input);
    },
  },

  Listing: {

    __resolveReference: async (ref: { id: string }) => {
  const useCase = container.resolve<GetListingByIdUseCase>(TOKENS_LISTING.usecase.getListingByIdUseCase);

  try {
    return await useCase.execute(ref.id);
  } catch {
    console.warn('⚠️ Missing listing:', ref.id);
    return null;
  }
},
    owner: (parent: any) => ({
      __typename: "User",
      id: parent.ownerId
    }),


    categories: (parent: any) =>
      parent.categories?.map(
        (id: string) => ({
          __typename: "Category",
          id
        })
      ) ?? [],


    amenities: (parent: any) =>
      parent.amenityIds?.map(
        (id: string) => ({
          __typename: "Amenity",
          id
        })
      ) ?? [],
  }
}
