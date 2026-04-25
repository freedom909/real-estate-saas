async execute(listingId: string) {
  const listing = await listingRepo.findById(listingId);

  // 👉 跨 subgraph 调用（通过 federation 或 HTTP）
  const reviews = await reviewClient.getReviews(listingId);

  const summary = await reviewAI.summarizeReviews(reviews);

  const prompt = `
Improve listing:

Title: ${listing.title}
Description: ${listing.description}

User feedback summary:
${summary}
`;

  const improved = await ai.generateText({ prompt });

  listing.applySuggestedDescription(improved);

  await listingRepo.save(listing);

  return listing;
}