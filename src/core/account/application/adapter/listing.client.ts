// src/core/account/application/adapter/listing.client.ts


import axios from "axios";
import { injectable } from "tsyringe";

@injectable()
export class ListingClient {
 
     private endpoint = "http://localhost:4101/graphql";

    async fetchListingData(userId: string): Promise<ListingExternalDTO[]> {

        const query = `

query GetListings($userId: ID!) {

listingsForOwner(userId: $userId) {

id

ownerId

}

}

`;

        const response = await axios.post(this.endpoint, {

            query,

            variables: { userId },

        });

        return response.data.data.listingsForOwner;

    }
    
}
 
   
