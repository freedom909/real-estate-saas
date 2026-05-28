import { IAmenityAdapter } from "./IAmenity.adapter";

class AmenityAdapter implements IAmenityAdapter {
  async getValidIds(ids: string[]): Promise<string[]> {
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

    const json = await res.json();
console.log(JSON.stringify(json, null, 2));
    return json.data?.amenitiesByIds?.map((a: any) => a.id) ?? [];
  }
}

export default AmenityAdapter;