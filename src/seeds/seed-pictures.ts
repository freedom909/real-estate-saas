import "dotenv/config";
import { connectMySQL } from "@/infrastructure/config/seq";
import ListingModel from "@/core/listing/infrastructure/models/listing.model";
import { Op } from "sequelize";
import { PictureModel } from "@/core/listing/infrastructure/models/picture.model";

const SEED_PICTURES = [
{
  "id": "3269d259-d0b0-4ca5-b4b8-52d2a0673f81",//uuid
  "listingId": "3269d259-d0b0-4ca5-b4b8-52d2a0673f81",
  "objectKey": "apple.jpg",
  "url": "http://localhost:9000/omaesama/apple.jpg",
  "mimeType": "image/jpeg",
  "size": 16200,
  "type": "cover",
  "sortOrder": 0
},
  {
    "id": "3269d259-d0b0-4ca5-b4b8-52d2a0673f82",//uuid
    "listingId": "3269d259-d0b0-4ca5-b4b8-52d2a0673f81",
    "objectKey": "orange.jpg",
    "url": "http://localhost:9000/omaesama/orange.jpg",
    "mimeType": "image/jpeg",
    "size": 16200,
    "type": "cover",
    "sortOrder": 1
  },
  {
    "id": "3269d259-d0b0-4ca5-b4b8-52d2a0673f83",//uuid
    "listingId": "3269d259-d0b0-4ca5-b4b8-52d2a0673f81",
    "objectKey": "banana.jpg",
    "url": "http://localhost:9000/omaesama/banana.jpg",
    "mimeType": "image/jpeg",
    "size": 16200,
    "type": "cover",
    "sortOrder": 2
  },
  {
    "id": "3269d259-d0b0-4ca5-b4b8-52d2a0673f84",//uuid
    "listingId": "3269d259-d0b0-4ca5-b4b8-52d2a0673f81",
    "objectKey": "peach.jpg",
    "url": "http://localhost:9000/omaesama/peach.jpg",
    "mimeType": "image/jpeg",
    "size": 16200,
    "type": "cover",
    "sortOrder": 3
  },
  {
    "id": "3269d259-d0b0-4ca5-b4b8-52d2a0673f85",//uuid
    "listingId": "3269d259-d0b0-4ca5-b4b8-52d2a0673f81",
    "objectKey": "grape.jpg",
    "url": "http://localhost:9000/omaesama/grape.jpg",
    "mimeType": "image/jpeg",
    "size": 16200,
    "type": "cover",
    "sortOrder": 4
  },
  {
    "id": "3269d259-d0b0-4ca5-b4b8-52d2a0673f86",//uuid
    "listingId": "3269d259-d0b0-4ca5-b4b8-52d2a0673f81",
    "objectKey": "watermelon.jpg",
    "url": "http://localhost:9000/omaesama/watermelon.jpg",
    "mimeType": "image/jpeg",
    "size": 16200,
    "type": "cover",
    "sortOrder": 5
  },
]


async function seed() {
  try {
    console.log("🔌 Connecting to MySQL...");

    await connectMySQL();

    console.log("✅ MySQL connected");

    /*
     * IMPORTANT:
     *
     * We only recreate the pictures table.
     *
     * DO NOT use:
     *
     * ListingModel.sync({ force: true })
     *
     * because that would delete the listings table.
     */

    await PictureModel.sync({ force: true });

    console.log("✅ Pictures table recreated");

    /*
     * Insert pictures
     */

    for (const picture of SEED_PICTURES) {
      const created = await PictureModel.create(picture);

      console.log(
        `  🖼️ Created picture: ${created.objectKey}`
      );
    }

    /*
     * Verify picture count
     */

    const count = await PictureModel.count();

    console.log(`\n✅ Seeded ${count} pictures`);

    /*
     * Verify the relationship
     */

    const listing = await ListingModel.findOne({
      where: {
        id: "3269d259-d0b0-4ca5-b4b8-52d2a0673f81",
      },

      include: [
        {
          model: PictureModel,
          as: "pictures",
        },
      ],
    });

    if (!listing) {
      console.log("❌ Listing not found");
    } else {
      console.log(
        `\n🏠 Listing: ${listing.get("title")}`
      );

      const pictures =
        (listing.get("pictures") as PictureModel[]) || [];

      console.log(
        `🖼️ Pictures: ${pictures.length}`
      );

      for (const picture of pictures) {
        console.log(
          `   - ${picture.objectKey} (${picture.sortOrder})`
        );
      }
    }

    console.log("\n🎉 Picture seed completed successfully");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seed failed:");

    console.error(error);

    process.exit(1);
  }
}

seed();