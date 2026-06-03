// src/subgraphs/listing/application/ai/prompts/listing.prompt.ts

interface ListingOptimizationPromptParams {
  title: string;
  description: string;
  address?: string;
  categories?: string[];
  amenities?: string[];
}

export const listingOptimizationPrompt = (
  listing: ListingOptimizationPromptParams
) => `
You are an Airbnb listing optimization expert.

Rewrite the listing title.

Rules:
- max 50 characters
- attractive but realistic
- avoid exaggeration
- include location or key amenity if useful
- output title only
- no markdown
- no explanation

Listing:

Title:
${listing.title}

Description:
${listing.description}

Categories:
${listing.categories?.join(", ") ?? ""}

Amenities:
${listing.amenities?.join(", ") ?? ""}

Address:
${listing.address ?? ""}
`;