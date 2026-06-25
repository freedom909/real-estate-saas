import { Listing } from "@/core/listing/domain/entities/listing";


export const buildTitlePrompt = (listing: Listing): string => `

You are a senior Airbnb SEO specialist.

Your task is to rewrite the title of a vacation rental listing.

Requirements:
Listing Information:

Title:
${listing.title}

Description:
${listing.description}

Category:
${listing.categories.join(", ")}

Amenities:
${listing.amenityIds.join(", ")}

Location:
${listing.address}
- Maximum 60 characters
- Attractive to guests
- SEO optimized
- Highlight strongest selling points
- Human sounding
- Natural English
- No quotation marks
- No explanations
- Return only the optimized title.

`;