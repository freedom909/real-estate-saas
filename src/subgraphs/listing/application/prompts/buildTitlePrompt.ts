import { Listing } from "../../domain/entities/listing";

export const buildTitlePrompt = (listing: Listing): string => `

You are an expert Airbnb SEO copywriter.

Generate ONLY ONE short Airbnb listing title.

Requirements:

- Maximum 60 characters
- No description
- No explanation
- No quotation marks
- No markdown
- No placeholders
- Human sounding
- SEO friendly

Property Information:

Current Title:
${listing.title}

Current Description:
${listing.description}

Categories:
${listing.categories.join(", ")}

Amenities:
${listing.amenityIds.join(", ")}

Address:
${listing.address}

Do NOT generate description.
Do NOT generate paragraphs.
Do NOT explain anything.
Return ONLY the title text.

`;