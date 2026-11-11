// Regression tests for chat listing-row serialization.
// Bug: AI search results showed placeholder images instead of the host's real
// photos — artifact content carried domain class instances (which JSON-serialize
// to {props:{...}}) with Picture objects (objectKey only), while the chat UI
// reads listing.picture?.[0] as an image URL.

import "reflect-metadata";
import { describe, it, expect, jest } from "@jest/globals";
import { container } from "tsyringe";

import {
  toChatListingRow,
  toChatListingRows,
} from "@/wisdom/agents/listing/listing-row.serializer";
import { TOKENS_PICTURE } from "@/modules/tokens/picture.tokens";

describe("listing-row.serializer (chat search result photos)", () => {
  const makePicture = (objectKey: string) => ({
    toJson: () => ({
      id: `pic-${objectKey}`,
      listingId: "listing-001",
      objectKey,
      type: "main",
      mimeType: "image/png",
      size: 100,
      sortOrder: 0,
    }),
  });

  const domainLikeListing = {
    id: "listing-001",
    ownerId: "owner-1",
    tenantId: "tenant-1",
    locationId: "loc-1",
    title: { getValue: () => "Sakura House Tokyo" },
    description: { getValue: () => "Cozy house" },
    categoryIds: ["c1"],
    amenityIds: ["a1"],
    numOfBeds: 2,
    numOfCustomers: 4,
    numOfBathrooms: 1,
    numOfRooms: 3,
    pricePerNight: 12000,
    isFeatured: true,
    pictures: [
      makePicture("uploads/photo1.jpg"),
      makePicture("https://generated.example/img2.png"),
    ],
    createdAt: "2026-01-01",
    updatedAt: "2026-01-02",
  };

  // Register a fresh mock for tests that require MinIO.
  const registerMockStorage = () => {
    const getUrl = jest
      .fn<(key: string) => Promise<string>>()
      .mockImplementation(
        async (key: string) =>
          `https://minio.example/signed/${key}`
      );

    container.register(TOKENS_PICTURE.storage.minioStorage, {
      useValue: { getUrl },
    });

    return getUrl;
  };

  beforeEach(() => {
    // Each test starts with an independent DI container.
    container.reset();
  });

  afterEach(() => {
    // Prevent registrations from leaking into other tests.
    container.reset();
    jest.restoreAllMocks();
  });

  it("falls back to objectKey when MinIO storage is not registered", async () => {
    const warnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    const row = await toChatListingRow(domainLikeListing);

    expect(row.picture).toEqual([
      "uploads/photo1.jpg",
      "https://generated.example/img2.png",
    ]);

    expect(warnSpy).toHaveBeenCalled();
  });

  it("resolves MinIO objectKeys to URLs and passes http(s) keys through", async () => {
    const getUrl = registerMockStorage();

    const row = await toChatListingRow(domainLikeListing);

    expect(getUrl).toHaveBeenCalledTimes(1);
    expect(getUrl).toHaveBeenCalledWith("uploads/photo1.jpg");

    expect(row.picture).toEqual([
      "https://minio.example/signed/uploads/photo1.jpg",
      "https://generated.example/img2.png",
    ]);
  });

  it("produces plain JSON rows with string title and resolved picture URLs", async () => {
    registerMockStorage();

    const row = await toChatListingRow(domainLikeListing);
    const revived = JSON.parse(JSON.stringify(row));

    expect(revived.props).toBeUndefined();
    expect(revived.title).toBe("Sakura House Tokyo");
    expect(revived.description).toBe("Cozy house");
    expect(revived.id).toBe("listing-001");
    expect(revived.pricePerNight).toBe(12000);
    expect(revived.picture?.[0]).toContain("http");
    expect(revived.pictures[0].url).toContain("http");
  });

  it("keeps fields used by booking flow and tolerates plain rows", async () => {
    registerMockStorage();

    const plainRow = {
      id: "listing-plain",
      title: "Plain Row Listing",
      description: "no pictures field",
      pricePerNight: 8000,
    };

    const rows = await toChatListingRows([
      plainRow,
      domainLikeListing,
    ]);

    expect(rows).toHaveLength(2);
    expect(rows[0].id).toBe("listing-plain");
    expect(rows[0].title).toBe("Plain Row Listing");
    expect(rows[0].picture).toEqual([]);
    expect(rows[1].id).toBe("listing-001");
    expect(rows[1].title).toBe("Sakura House Tokyo");
  });
});

