import "reflect-metadata";
import { connectMySQL } from "@/infrastructure/config/seq";
import ListingModel from "@/core/listing/infrastructure/models/listing.model";
import { Op } from "sequelize";

// Test 1: Direct DB search for Kyoto
async function testDirectSearch() {
  console.log("=== Test 1: Direct DB search for 'Kyoto' ===");
  const results = await ListingModel.findAll({
    where: {
      [Op.or]: [
        { address: { [Op.like]: "%Kyoto%" } },
        { title: { [Op.like]: "%Kyoto%" } },
      ],
    },
  });
  console.log(`Found ${results.length} Kyoto listings:`);
  for (const r of results) {
    console.log(`  - ${r.get("title")} | ${r.get("address")} | ¥${r.get("price")}`);
  }
  return results;
}

// Test 2: Semantic extractors
async function testExtractors() {
  console.log("\n=== Test 2: Semantic Extractors ===");
  const { LocationExtractor } = await import("@/wisdom/semantic/extractors/location.extractor");
  const { DateExtractor } = await import("@/wisdom/semantic/extractors/date.extractor");
  const { IntentExtractor } = await import("@/wisdom/semantic/extractors/intent.extractor");

  const locationExt = new LocationExtractor();
  const dateExt = new DateExtractor();
  const intentExt = new IntentExtractor();

  const testMessages = [
    "find a room for me at next week in Kyoto",
    "find a room in Tokyo",
    "search listings near Osaka",
    "find a place in New York for this weekend",
    "tomorrow in Shibuya",
  ];

  for (const msg of testMessages) {
    console.log(`\n  Message: "${msg}"`);

    const intent = intentExt.extract(msg);
    console.log(`    Intent: ${JSON.stringify(intent)}`);

    const location = locationExt.extract(msg);
    console.log(`    Location: ${JSON.stringify(location)}`);

    const dates = dateExt.extract(msg);
    console.log(`    Dates: ${JSON.stringify(dates)}`);
  }
}

// Test 3: Full ListingRepository search (via UseCase pattern)
async function testRepositorySearch() {
  console.log("\n=== Test 3: Repository search for 'Kyoto' ===");
  const { ListingRepository } = await import("@/core/listing/infrastructure/persistence/listing.repository");
  const { TOKENS_LISTING } = await import("@/modules/tokens/listing.tokens");
  const ListingCategories = (await import("@/core/listing/infrastructure/models/listingCategories.model")).default;
  const ListingAmenity = (await import("@/core/listing/infrastructure/models/listingAmenities.model")).default;
  const { container } = await import("tsyringe");

  // Register dependencies
  container.register(TOKENS_LISTING.models.listingModel, { useValue: ListingModel });
  container.register(TOKENS_LISTING.models.listingCategoriesModel, { useValue: ListingCategories });
  container.register(TOKENS_LISTING.models.listingAmenityModel, { useValue: ListingAmenity });
  container.register(TOKENS_LISTING.sequelize, { useValue: (await import("@/infrastructure/config/seq")).sequelize });
  container.register(TOKENS_LISTING.repos.listingRepository, { useClass: ListingRepository });

  const repo = container.resolve<ListingRepository>(TOKENS_LISTING.repos.listingRepository);
  const results = await repo.search({ location: "Kyoto" });
  console.log(`Found ${results.length} listings via repo.search({ location: "Kyoto" }):`);
  for (const r of results) {
    console.log(`  - ${r.title} | ${r.address} | ¥${r.price}`);
  }
  return results;
}

async function main() {
  await connectMySQL();

  const directResults = await testDirectSearch();
  await testExtractors();
  const repoResults = await testRepositorySearch();

  console.log("\n=== Summary ===");
  console.log(`Direct search: ${directResults.length} results`);
  console.log(`Repository search: ${repoResults.length} results`);

  if (directResults.length > 0 && repoResults.length > 0) {
    console.log("\n✅ All tests passed! Search is working.");
  } else {
    console.log("\n⚠️ Some tests returned 0 results.");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
