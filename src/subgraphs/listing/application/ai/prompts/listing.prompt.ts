//src/subgraphs/listing/application/ai/prompts/listing.prompt.ts

export const listingOptimizationPrompt = (
  title: string,
  description: string
) => `
You are an Airbnb optimization expert.

Improve this listing.

Title:
${title}

Description:
${description}

Return:
1. Better title
2. Better description
3. SEO suggestions
`;