import { inject, injectable } from "tsyringe";
import { v4 as uuidv4 } from "uuid";

import { TOKENS_PICTURE } from "@/modules/tokens/picture.tokens";
import { MinioStorage } from "../../infrastructure/storage/minio.storage";
import { IPictureRepository } from "../../domain/repositories/picture.repository";
import { Picture } from "../../domain/entities/picture";

@injectable()
export class UploadImageUseCase {
  constructor(
    @inject(TOKENS_PICTURE.storage.minioStorage)
    private minioStorage: MinioStorage,
    @inject(TOKENS_PICTURE.repos.pictureRepository)
    private pictureRepository: IPictureRepository
  ) {}

  async execute(
    files: any[],
    listingId: string,
    options: { persist?: boolean } = {}
  ): Promise<Picture[]> {
    const { persist = false } = options;
    if (!listingId) {
      throw new Error("listingId is required for image upload");
    }

    const pictures: Picture[] = [];

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const upload = await file;
      const { filename, mimetype, createReadStream } = upload;

      const stream = createReadStream();
      const chunks: Buffer[] = [];

      await new Promise<void>((resolve, reject) => {
        stream.on("data", (chunk: Buffer) => chunks.push(chunk));
        stream.on("end", () => resolve());
        stream.on("error", reject);
      });

      const buffer = Buffer.concat(chunks);

      const result = await this.minioStorage.upload({
        listingId,
        buffer,
        mimeType: mimetype || "application/octet-stream",
        originalName: filename,
      });

      const picture = new Picture({
        id: uuidv4(),
        listingId,
        objectKey: result.objectKey,
        mimeType: result.mimeType,
        size: result.size,
        type: "listing",
        sortOrder: index,
      });

      if (persist) {
        const saved = await this.pictureRepository.create(picture);
        pictures.push(saved);
      } else {
        pictures.push(picture);
      }
    }

    return pictures;
  }
}


