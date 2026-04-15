// FILE: src/subgraphs/listing/application/prompts/buildDescriptionPrompt.ts

import { Listing } from "../../domain/entities/Listing";

export const buildDescriptionPrompt = (listing: Listing): string => `
You are an expert Airbnb listing copywriter.

Improve the description to be more engaging and persuasive.

Title:
${listing.title}

Current Description:
${listing.description}

Return ONLY the new description.
`;