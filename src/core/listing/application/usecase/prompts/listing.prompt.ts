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

Return ONLY valid JSON.
Rules:
- No markdown
- No explanations
- No comments
- Use double quotes only
- No trailing commas
- Output must be valid JSON.parse() format

Return EXACTLY this schema:

{
  "title": "string",
  "description": "string",
  "seo": ["string"],
  "tips": ["string"]
}

Listing:

Title:
${listing.title}

Description:
${listing.description}

Categories:
${listing.categories.join(", ")}

Amenities:
${listing.amenities.join(", ")}
`;

