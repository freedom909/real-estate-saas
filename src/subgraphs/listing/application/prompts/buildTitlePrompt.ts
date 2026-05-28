import { Listing } from "../../domain/entities/Listing";

export const buildTitlePrompt = (listing: Listing): string => `
You are an expert Airbnb listing copywriter.

Rewrite the title to be more attractive and high-converting.

Current Title:
${listing.title}

Description:
${listing.description}

Return ONLY the new title.
`;