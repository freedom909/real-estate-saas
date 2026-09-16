import "reflect-metadata";

import { connectMySQL } from "@/infrastructure/config/seq";
import ListingModel from "@/core/listing/infrastructure/models/listing.model";

import { IListingRepository } from "@/core/listing/domain/entities/IListingRepository";
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { container } from "tsyringe";
import LocationModel from "@/core/location/infrastructure/persistence/location.model";

// ============================================================
// Test 1: Find Kyoto Location
// ============================================================

async function findKyotoLocation() {
  console.log("=== Test 1: Find Kyoto Location ===");

  const locations = await LocationModel.findAll();

  const kyoto = locations.find((location: any) => {
    const json = location.toJSON();

    return (
      json.name === "Kyoto" ||
      json.name?.toLowerCase?.() === "kyoto"
    );
  });

  if (!kyoto) {
    console.log("No Kyoto location found.");

    console.log("Available locations:");

    for (const location of locations) {
      const json = location.toJSON();

      console.log(
        `  - ${json.id} | ${json.name}`,
      );
    }

    return null;
  }

  const json = kyoto.toJSON();

  console.log(
    `Found Kyoto location: ${json.id} | ${json.name}`,
  );

  return json.id as string;
}

// ============================================================
// Test 2: Direct DB search by locationId
// ============================================================

async function testDirectSearch(locationId: string) {
  console.log(
    "\n=== Test 2: Direct DB search by locationId ===",
  );

  const results = await ListingModel.findAll({
    where: {
      locationId,
    },
    order: [["createdAt", "DESC"]],
  });

  console.log(
    `Found ${results.length} listings for locationId=${locationId}:`,
  );

  for (const r of results) {
    console.log(
      `  - ${r.title} | locationId=${r.locationId} | ¥${r.pricePerNight}`,
    );
  }

  return results;
}

// ============================================================
// Test 3: Semantic extractors
// ============================================================

async function testExtractors() {
  console.log("\n=== Test 3: Semantic Extractors ===");

  const {
    LocationExtractor,
  } = await import(
    "@/wisdom/semantic/extractors/location.extractor"
  );

  const {
    DateExtractor,
  } = await import(
    "@/wisdom/semantic/extractors/date.extractor"
  );

  const {
    IntentExtractor,
  } = await import(
    "@/wisdom/semantic/extractors/intent.extractor"
  );

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
    console.log(
      `    Intent: ${JSON.stringify(intent)}`,
    );

    const location = locationExt.extract(msg);
    console.log(
      `    Location: ${JSON.stringify(location)}`,
    );

    const dates = dateExt.extract(msg);
    console.log(
      `    Dates: ${JSON.stringify(dates)}`,
    );
  }
}

// ============================================================
// Test 4: Full ListingRepository search
// ============================================================

async function testRepositorySearch(locationId: string) {
  console.log(
    "\n=== Test 4: Repository search by locationId ===",
  );

  const {
    ListingRepository,
  } = await import(
    "@/core/listing/infrastructure/persistence/listing.repository"
  );

  const ListingCategories = (
    await import(
      "@/core/listing/infrastructure/models/listingCategories.model"
    )
  ).default;

  const ListingAmenity = (
    await import(
      "@/core/listing/infrastructure/models/listingAmenities.model"
    )
  ).default;

  const {
    sequelize,
  } = await import(
    "@/infrastructure/config/seq"
  );

  // Register dependencies
  container.register(
    TOKENS_LISTING.models.listingModel,
    {
      useValue: ListingModel,
    },
  );

  container.register(
    TOKENS_LISTING.models.listingCategoriesModel,
    {
      useValue: ListingCategories,
    },
  );

  container.register(
    TOKENS_LISTING.models.listingAmenityModel,
    {
      useValue: ListingAmenity,
    },
  );

  container.register(
    TOKENS_LISTING.sequelize,
    {
      useValue: sequelize,
    },
  );

  container.register(
    TOKENS_LISTING.repos.listingRepository,
    {
      useClass: ListingRepository,
    },
  );

const repo = container.resolve<IListingRepository>(
  TOKENS_LISTING.repos.listingRepository,
);

  const results = await repo.search({
    locationId,
  });

  console.log(
    `Found ${results.length} listings via repository:`,
  );

  for (const listing of results) {
    console.log(
      `  - ${listing.title} | locationId=${listing.locationId} | ¥${listing.pricePerNight}`,
    );
  }

  return results;
}

// ============================================================
// Main
// ============================================================

async function main() {
  await connectMySQL();

  const locationId = await findKyotoLocation();

  if (!locationId) {
    console.log(
      "\nNo Kyoto location exists. Search test cannot continue.",
    );

    process.exit(0);
  }

  const directResults =
    await testDirectSearch(locationId);

  await testExtractors();

  const repoResults =
    await testRepositorySearch(locationId);

  console.log("\n=== Summary ===");

  console.log(
    `Direct search: ${directResults.length} results`,
  );

  console.log(
    `Repository search: ${repoResults.length} results`,
  );

  if (
    directResults.length > 0 &&
    repoResults.length > 0
  ) {
    console.log(
      "\n✅ All listing search tests passed!",
    );
  } else {
    console.log(
      "\n⚠️ Search infrastructure works, but no listings were found.",
    );
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(
    "\n❌ Test failed:",
    err,
  );

  process.exit(1);
});