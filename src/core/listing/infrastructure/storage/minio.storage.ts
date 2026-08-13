// src/core/listing/infrastructure/storage/minio.storage.ts

import { Client } from "minio";
import { randomUUID } from "crypto";
import { extname } from "path";

export interface UploadImageInput {
  listingId: string;
  buffer: Buffer;
  mimeType: string;
  originalName?: string;
}

export interface StoredImage {
  objectKey: string;
  size: number;
  mimeType: string;
}

export class MinioStorage {
  private readonly client: Client;
  private readonly bucket: string;

  constructor() {
    this.bucket =
      process.env.MINIO_BUCKET || "listing-images";

    this.client = new Client({
      endPoint:
        process.env.MINIO_ENDPOINT || "localhost",

      port:
        Number(process.env.MINIO_PORT) || 9000,

      useSSL:
        process.env.MINIO_USE_SSL === "true",

      accessKey:
        process.env.MINIO_ACCESS_KEY || "minioadmin",

      secretKey:
        process.env.MINIO_SECRET_KEY || "minioadmin",
    });
  }

  async ensureBucket(): Promise<void> {
    const exists = await this.client.bucketExists(
      this.bucket
    );

    if (!exists) {
      await this.client.makeBucket(
        this.bucket,
        "us-east-1"
      );
    }
  }

  async upload(input: UploadImageInput): Promise<StoredImage> {
    await this.ensureBucket();

    // ✅ Use original filename to determine extension
    const extension = extname(input.originalName || "").toLowerCase() || ".bin";

    const objectKey =
      `listings/${input.listingId}/${randomUUID()}${extension}`;

    await this.client.putObject(
      this.bucket,
      objectKey,
      input.buffer,
      input.buffer.length,
      {
        "Content-Type":
          input.mimeType || "application/octet-stream",
      }
    );

    return {
      objectKey,
      size: input.buffer.length,
      mimeType:
        input.mimeType || "application/octet-stream",
    };
  }

  async delete(objectKey: string): Promise<void> {
    await this.client.removeObject(
      this.bucket,
      objectKey
    );
  }

  async getUrl(objectKey: string): Promise<string> {
    return this.client.presignedGetObject(
      this.bucket,
      objectKey,
      60 * 60
    );
  }
}