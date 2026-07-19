/**
 * E2E test for the full booking flow.
 *
 * Prerequisites:
 *   - MySQL running on localhost:3306 (database: saas)
 *   - Listing subgraph on localhost:4101
 *   - Booking subgraph on localhost:4030
 *   - Gateway on localhost:4000
 *
 * Run:
 *   npx tsx src/__tests__/e2e/booking-flow.test.ts
 */

const GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:4000/graphql";
const LISTING_URL = process.env.LISTING_SUBGRAPH_URL || "http://localhost:4101/graphql";
const BOOKING_URL = process.env.BOOKING_SUBGRAPH_URL || "http://localhost:4030/graphql";
const INTERNAL_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || "1234567890";

async function gql(url: string, query: string, variables: Record<string, any> = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${INTERNAL_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error(JSON.stringify(json.errors, null, 2));
  }
  return json.data;
}

let listingId: string;

async function createListing() {
  console.log("\n1. Creating test listing...");
  const data = await gql(LISTING_URL, `
    mutation CreateListing($input: CreateListingInput!) {
      createListing(input: $input) {
        id
        title
        price
      }
    }
  `, {
    input: {
      title: "E2E Test Listing",
      description: "Automated test listing",
      address: "123 Test Street",
      ownerId: "test-owner-1",
      locationId: "test-location-1",
      categories: [],
      numOfBeds: 2,
      numOfCustomers: 2,
      numOfBathrooms: 1,
      numOfRooms: 1,
      price: 5000,
    },
  });
  listingId = data.createListing.id;
  console.log(`   Created listing: ${listingId} (price: ¥${data.createListing.price})`);
  return data.createListing;
}

async function createBooking(listingId: string) {
  console.log("\n2. Creating booking (check-in: 2024-07-01, check-out: 2024-07-04)...");
  const data = await gql(BOOKING_URL, `
    mutation CreateBooking($input: CreateBookingInput!) {
      createBooking(input: $input) {
        success
        message
        booking {
          id
          price
          status
          checkInDate
          checkOutDate
          listing {
            id
            title
            price
          }
        }
      }
    }
  `, {
    input: {
      listingId,
      checkInDate: "2024-07-01T00:00:00.000Z",
      checkOutDate: "2024-07-04T00:00:00.000Z",
    },
  });
  const booking = data.createBooking.booking;
  console.log(`   Created booking: ${booking.id}`);
  console.log(`   Status: ${booking.status}`);
  console.log(`   Total price: ¥${booking.price}`);
  console.log(`   Listing price: ¥${booking.listing?.price}`);
  return booking;
}

async function fetchBooking(bookingId: string) {
  console.log("\n3. Fetching booking by ID...");
  const data = await gql(BOOKING_URL, `
    query GetBooking($id: ID!) {
      booking(id: $id) {
        id
        price
        status
        checkInDate
        checkOutDate
        listing {
          id
          title
          price
        }
      }
    }
  `, { id: bookingId });
  const booking = data.booking;
  console.log(`   Booking: ${booking.id}`);
  console.log(`   Total price: ¥${booking.price}`);
  console.log(`   Listing nightly: ¥${booking.listing?.price}`);
  return booking;
}

async function run() {
  const errors: string[] = [];

  try {
    // Step 1: Create listing
    const listing = await createListing();
    const nightlyPrice = 5000;

    // Step 2: Create booking (3 nights)
    const booking = await createBooking(listingId);
    const expectedPrice = nightlyPrice * 3; // 15000

    // Step 3: Verify price
    console.log("\n4. Verifying price...");
    if (booking.price === expectedPrice) {
      console.log(`   PASS: Booking price ¥${booking.price} matches expected ¥${expectedPrice}`);
    } else {
      const msg = `FAIL: Booking price ¥${booking.price} does not match expected ¥${expectedPrice}`;
      console.log(`   ${msg}`);
      errors.push(msg);
    }

    // Step 4: Verify listing price is reflected
    if (booking.listing?.price === nightlyPrice) {
      console.log(`   PASS: Listing nightly price ¥${booking.listing.price} matches ¥${nightlyPrice}`);
    } else {
      const msg = `FAIL: Listing nightly price ¥${booking.listing?.price} does not match ¥${nightlyPrice}`;
      console.log(`   ${msg}`);
      errors.push(msg);
    }

    // Step 5: Re-fetch and verify consistency
    const fetched = await fetchBooking(booking.id);
    if (fetched.price === expectedPrice) {
      console.log(`   PASS: Re-fetched price ¥${fetched.price} matches expected ¥${expectedPrice}`);
    } else {
      const msg = `FAIL: Re-fetched price ¥${fetched.price} does not match expected ¥${expectedPrice}`;
      console.log(`   ${msg}`);
      errors.push(msg);
    }

    // Step 6: Verify input.price is ignored (send price: 0)
    console.log("\n5. Verifying input.price is ignored (sending price: 0)...");
    const data = await gql(BOOKING_URL, `
      mutation CreateBooking($input: CreateBookingInput!) {
        createBooking(input: $input) {
          success
          booking {
            id
            price
          }
        }
      }
    `, {
      input: {
        listingId,
        checkInDate: "2024-07-10T00:00:00.000Z",
        checkOutDate: "2024-07-12T00:00:00.000Z",
        price: 0,
      },
    });
    const booking2 = data.createBooking.booking;
    const expected2 = nightlyPrice * 2; // 10000
    if (booking2.price === expected2) {
      console.log(`   PASS: price:0 ignored, got ¥${booking2.price} (expected ¥${expected2})`);
    } else {
      const msg = `FAIL: price:0 not ignored, got ¥${booking2.price} (expected ¥${expected2})`;
      console.log(`   ${msg}`);
      errors.push(msg);
    }

  } catch (e: any) {
    console.error(`\nERROR: ${e.message}`);
    errors.push(e.message);
  }

  console.log("\n" + "=".repeat(50));
  if (errors.length === 0) {
    console.log("ALL TESTS PASSED");
  } else {
    console.log(`${errors.length} TEST(S) FAILED`);
    errors.forEach((e) => console.log(`  - ${e}`));
    process.exit(1);
  }
}

run();
