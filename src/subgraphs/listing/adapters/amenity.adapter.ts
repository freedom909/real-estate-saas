import { IAmenityAdapter } from "./IAmenity.adapter";

class AmenityAdapter implements IAmenityAdapter {
  async getValidIds(ids: string[]): Promise<string[]> {
    if (ids.length === 0) {
      return [];
    }

    const res = await fetch("http://localhost:4090/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query ($ids: [ID!]!) {
            amenitiesByIds(ids: $ids) {
              id
            }
          }
        `,
        variables: { ids },
      }),
    });

    if (!res.ok) {
      throw new Error(`Amenity service returned ${res.status}`);
    }

    const json = await res.json();
    if (json.errors?.length) {
      throw new Error(json.errors[0].message ?? "Amenity service failed");
    }

    return json.data?.amenitiesByIds?.map((amenity: { id: string }) => amenity.id) ?? [];
  }
}

export default AmenityAdapter;
