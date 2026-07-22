import { listingService } from "./services/listing.service";

async function handleCreate() {
  await listingService.create({
    title: "test",
    description: "test",
    price: 100,

  });
}