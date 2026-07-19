import { container } from "tsyringe";

import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";

import { IListingRepository } from "@/core/listing/domain/entities/IListingRepository";

import CreateListingUseCase from "@/core/listing/application/usecase/createListing.usecase";
import GetListingByIdUseCase from "@/core/listing/application/usecase/getListingById.usecase.ts";

export const resolvers = {
  Query: {

    listings: async () => {

      const repo =
        container.resolve<IListingRepository>(
          TOKENS_LISTING.repos.listingRepository
        );

      return repo.findAll();
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


    listingsByOwner: async (
      _: any,
      { ownerId }: { ownerId:string }
    ) => {

      const repo =
        container.resolve<IListingRepository>(
          TOKENS_LISTING.repos.listingRepository
        );

      return repo.findByOwnerId(ownerId);
    },


  },


  Mutation: {

    createListing: async (
      _: any,
      {input}:any
    ) => {

      const useCase =
        container.resolve<CreateListingUseCase>(
          TOKENS_LISTING.usecase.createListingUseCase
        );

      return useCase.execute(input);

    },

  },


  Listing: {
__resolveReference: async (ref: { id: string }) => {
  const useCase = container.resolve<GetListingByIdUseCase>(
    TOKENS_LISTING.usecase.getListingByIdUseCase
  );

  try {
    return await useCase.execute(ref.id);
  } catch {
    console.warn('⚠️ Missing listing:', ref.id);
    return null;
  }
},
    owner:
      (parent:any)=>({

        __typename:"User",

        id:parent.ownerId,

      }),


    categories:
      (parent:any)=>
        parent.categories?.map(
          (id:string)=>({
            __typename:"Category",
            id
          })
        ) || [],



    amenities:
      (parent:any)=>
        parent.amenityIds?.map(
          (id:string)=>({
            __typename:"Amenity",
            id
          })
        ) || [],

  },



  Owner: {

    listings:
      async(parent:{id:string})=>{

        const repo =
          container.resolve<IListingRepository>(
            TOKENS_LISTING.repos.listingRepository
          );

        return repo.findByOwnerId(parent.id);

      }

  }


};