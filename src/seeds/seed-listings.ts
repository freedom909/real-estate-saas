import "dotenv/config";
import { connectMySQL } from "@/infrastructure/config/seq";
import ListingModel from "@/core/listing/infrastructure/models/listing.model";
import { Op } from "sequelize";

const LISTINGS = [
  {
    id: "lst-kyoto-001",
    title: "Traditional Machiya in Gion, Kyoto",
    description: "A beautifully restored traditional wooden townhouse in the heart of Gion district. Walking distance to temples, tea houses, and the Kamo River. Perfect for experiencing authentic Kyoto culture.",
    ownerId: "owner-001",
    locationId: "loc-kyoto",
    address: "Gion, Higashiyama, Kyoto, Japan",
    numOfBeds: 2,
    numOfCustomers: 4,
    numOfBathrooms: 1,
    numOfRooms: 2,
    price: 12000,
    picture: [],
    isFeatured: true,
  },
  {
    id: "lst-kyoto-002",
    title: "Modern Apartment near Kyoto Station",
    description: "Bright and modern 1-bedroom apartment just 5 minutes walk from Kyoto Station. Easy access to all major attractions. Fully equipped kitchen and free WiFi.",
    ownerId: "owner-001",
    locationId: "loc-kyoto",
    address: "Shimogyo-ku, Kyoto, Japan",
    numOfBeds: 1,
    numOfCustomers: 2,
    numOfBathrooms: 1,
    numOfRooms: 1,
    price: 7500,
    picture: [],
    isFeatured: false,
  },
  {
    id: "lst-kyoto-003",
    title: "Riverside Guesthouse in Arashiyama",
    description: "Cozy guesthouse located along the Oi River in Arashiyama. Enjoy stunning views of the bamboo grove and Togetsukyo Bridge. Traditional Japanese breakfast included.",
    ownerId: "owner-002",
    locationId: "loc-kyoto-west",
    address: "Arashiyama, Ukyo-ku, Kyoto, Japan",
    numOfBeds: 3,
    numOfCustomers: 6,
    numOfBathrooms: 2,
    numOfRooms: 3,
    price: 18000,
    picture: [],
    isFeatured: true,
  },
  {
    id: "lst-tokyo-001",
    title: "Shibuya Loft with City Views",
    description: "Stylish loft apartment in the heart of Shibuya with panoramic city views. Modern amenities, great nightlife access, and Shibuya Crossing is just downstairs.",
    ownerId: "owner-003",
    locationId: "loc-tokyo",
    address: "Shibuya, Tokyo, Japan",
    numOfBeds: 1,
    numOfCustomers: 2,
    numOfBathrooms: 1,
    numOfRooms: 1,
    price: 15000,
    picture: [],
    isFeatured: true,
  },
  {
    id: "lst-tokyo-002",
    title: "Traditional Ryokan in Asakusa",
    description: "Experience traditional Japanese hospitality in this charming ryokan near Senso-ji temple. Tatami rooms, onsen bath, and kaiseki dinner available.",
    ownerId: "owner-003",
    locationId: "loc-tokyo-east",
    address: "Taito-ku, Asakusa, Tokyo, Japan",
    numOfBeds: 4,
    numOfCustomers: 8,
    numOfBathrooms: 2,
    numOfRooms: 4,
    price: 25000,
    picture: [],
    isFeatured: false,
  },
  {
    id: "lst-osaka-001",
    title: "Dotonbori Studio Apartment",
    description: "Compact studio right in the Dotonbori entertainment district. Steps away from street food, shopping, and nightlife. The perfect base for exploring Osaka.",
    ownerId: "owner-004",
    locationId: "loc-osaka",
    address: "Namba, Chuo-ku, Osaka, Japan",
    numOfBeds: 1,
    numOfCustomers: 2,
    numOfBathrooms: 1,
    numOfRooms: 1,
    price: 8000,
    picture: [],
    isFeatured: false,
  },
  {
    id: "lst-osaka-002",
    title: "Family Room in Osaka Castle Area",
    description: "Spacious 2-bedroom apartment near Osaka Castle park. Great for families with kids. Close to subway station and supermarket. Quiet neighborhood.",
    ownerId: "owner-004",
    locationId: "loc-osaka-north",
    address: "Chuo-ku, Osaka Castle, Osaka, Japan",
    numOfBeds: 2,
    numOfCustomers: 5,
    numOfBathrooms: 1,
    numOfRooms: 2,
    price: 10000,
    picture: [],
    isFeatured: true,
  },
];

async function seed() {
  await connectMySQL();

  // Sync the model (create table if not exists)
  await ListingModel.sync({ force: true });
  console.log("✅ Listings table synced");

  // Insert seed data
  for (const listing of LISTINGS) {
    await ListingModel.create(listing);
    console.log(`  🏠 Created: ${listing.title}`);
  }

  console.log(`\n✅ Seeded ${LISTINGS.length} listings`);

  // Verify
  const count = await ListingModel.count();
  console.log(`📊 Total listings in DB: ${count}`);

  // Test search
  const results = await ListingModel.findAll({
    where: {
      [Op.or]: [
        { address: { [Op.like]: "%Kyoto%" } },
        { title: { [Op.like]: "%Kyoto%" } },
      ],
    },
  });
  console.log(`🔍 Kyoto listings: ${results.length}`);
  for (const r of results) {
    console.log(`   - ${r.get("title")} (${r.get("address")})`);
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
