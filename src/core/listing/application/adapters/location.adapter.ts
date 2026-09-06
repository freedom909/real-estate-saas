//src/core/listing/application/adapters/location.adapter.ts

import { ILocationAdapter } from "./ILcation.adapter";



export class LocationAdapter implements ILocationAdapter {
  async getValidId(id: number): Promise<number> {
    const res = await fetch("http://localhost:4080/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query ($id: ID!) {
            locationsById(id: $id) {
              id
            }
          }
        `,
        variables: { id },
      }),
    });

    const json = await res.json();
console.log(JSON.stringify(json, null, 2));
    return json.data?.locationsById?.id ?? 0;
  }
}

export default LocationAdapter;
