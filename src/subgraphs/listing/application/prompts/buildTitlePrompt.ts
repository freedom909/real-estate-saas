import { Listing } from "../../domain/entities/listing";

export const buildTitlePrompt = (listing: Listing): string => `
You are an expert Airbnb marketing copywriter.

Generate a compelling and realistic listing title
for a vacation rental property.

Requirements:

- Natural human language
- SEO friendly
- Attractive for guests
- Do NOT use placeholders
- Do NOT use brackets
- Keep under 60 characters

Listing Information:

Title:
${listing.title}

Description:
${listing.description}

Amenities:
${listing.amenityIds.join(", ")}

Categories:
${listing.categories.join(", ")}

Address:
${listing.address}

Return ONLY the improved title.
`;