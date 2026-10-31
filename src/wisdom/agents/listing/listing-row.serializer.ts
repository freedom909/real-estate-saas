// src/wisdom/agents/listing/listing-row.serializer.ts
//
// Chat artifacts travel over GraphQL `JSON`. Domain entities (Listing/Picture)
// keep their data in private `props`, so JSON.stringify flattens them to
// `{props:{...}}` — which the frontend cannot read (it expects
// `listing.picture?.[0]` to be an image URL and `listing.title` to be a string).
// So before putting listings into artifact content we flatten them to plain
// JSON rows and resolve picture URLs the same way the listing subgraph's
// `Picture.url` resolver does (MinIO presigned URLs via MinioStorage.getUrl).

import { container } from "tsyringe";
import { TOKENS_PICTURE } from "@/modules/tokens/picture.tokens";
import { MinioStorage } from "@/core/listing/infrastructure/storage/minio.storage";

const isHttpUrl = (value: string): boolean => /^https?:\/\//i.test(value);

async function resolvePictureUrl(objectKey: string): Promise<string> {
  if (!objectKey || isHttpUrl(objectKey)) return objectKey;
  try {
    const storage = container.resolve<MinioStorage>(
      TOKENS_PICTURE.storage.minioStorage
    );
    return await storage.getUrl(objectKey);
  } catch (err) {
    console.warn(
      "[ListingRow] picture URL resolution failed, using objectKey:",
      err
    );
    return objectKey;
  }
}

function plainText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof (value as { getValue?: () => unknown }).getValue === "function") {
    return String((value as { getValue: () => unknown }).getValue());
  }
  return value == null ? "" : String(value);
}

export async function toChatListingRow(
  raw: any
): Promise<Record<string, unknown>> {
  const rawPictures: any[] = Array.isArray(raw?.pictures) ? raw.pictures : [];
  const pictures = rawPictures.map((p) =>
    p && typeof p.toJson === "function" ? p.toJson() : p
  );
  const urls = await Promise.all(
    pictures.map((p) => resolvePictureUrl(String(p?.objectKey ?? "")))
  );

  return {
    id: raw?.id,
    ownerId: raw?.ownerId,
    tenantId: raw?.tenantId,
    locationId: raw?.locationId,
    title: plainText(raw?.title),
    description: plainText(raw?.description),
    categoryIds: raw?.categoryIds ?? [],
    amenityIds: raw?.amenityIds ?? [],
    numOfBeds: raw?.numOfBeds ?? 1,
    numOfCustomers: raw?.numOfCustomers ?? 1,
    numOfBathrooms: raw?.numOfBathrooms ?? 1,
    numOfRooms: raw?.numOfRooms ?? 1,
    pricePerNight: raw?.pricePerNight,
    isFeatured: raw?.isFeatured ?? false,
    createdAt: raw?.createdAt,
    updatedAt: raw?.updatedAt,
    pictures: pictures.map((p, i) => ({ ...p, url: urls[i] })),
    // ChatWindow.tsx / assistant page read listing.picture?.[0] (first image URL)
    picture: urls,
  };
}

export async function toChatListingRows(
  listings: readonly any[] = []
): Promise<Record<string, unknown>[]> {
  return Promise.all(listings.map((l) => toChatListingRow(l)));
}
