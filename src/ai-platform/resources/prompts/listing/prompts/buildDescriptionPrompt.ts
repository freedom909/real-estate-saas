// FILE: src/subgraphs/listing/application/prompts/buildDescriptionPrompt.ts

import { Listing } from "@/core/listing/domain/entities/listing";



export const buildDescriptionPrompt = (listing: Listing): string => `
You are an expert Airbnb copywriter.

Generate an engaging property description.

Requirements:

- Natural human language
- Guest-focused
- Persuasive but realistic
- No placeholders
- No markdown
- 100-200 words

Property Information:

Title:
${listing.title}

Current Description:
${listing.description}

Amenities:
${listing.amenityIds.join(", ")}

Categories:
${listing.categories.join(", ")}

Address:
${listing.address}

Return ONLY the improved description.
`;

