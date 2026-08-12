//src/core/listing/application/usecase/uploadImages.usecase.ts

import { inject, injectable } from "tsyringe";

import { TOKENS_PICTURE } from "@/modules/tokens/picture.tokens";
import { MinioStorage } from "../../infrastructure/storage/minio.storage";

@injectable()
export class UploadImageUseCase {
  constructor(
    @inject(TOKENS_PICTURE.storage.minioStorage)
    private minioStorage: MinioStorage
  ) {}

  async execute(files: any[]) {
    const pictures = [];

    for (const file of files) {
      // GraphQL Upload spec: file is a Promise resolving to { filename, mimeType, createReadStream }
      const upload = await file;
      const { filename, mimeType, createReadStream } = upload;

      // Read the stream into a buffer
      const stream = createReadStream();
      const chunks: Buffer[] = [];

      await new Promise<void>((resolve, reject) => {
        stream.on("data", (chunk: Buffer) => chunks.push(chunk));
        stream.on("end", () => resolve());
        stream.on("error", reject);
      });

      const buffer = Buffer.concat(chunks);

      // Upload to MinIO
      const result = await this.minioStorage.upload({
        listingId: "pending", // Will be updated when listing is created
        buffer,
        mimeType: mimeType || "application/octet-stream",
        originalName: filename,
      });

      // Generate a presigned URL for immediate use
      const url = await this.minioStorage.getUrl(result.objectKey);

      pictures.push({
        objectKey: result.objectKey,
        url,
        mimeType: result.mimeType,
        size: result.size,
      });
    }

    return pictures;
  }
}
