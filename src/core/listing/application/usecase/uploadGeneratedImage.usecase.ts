//src/core/listing/application/usecase/uploadGeneratedImage.usecase.ts

import { inject, injectable } from "tsyringe";


import { TOKENS_PICTURE } from "@/modules/tokens/picture.tokens";
import { MinioStorage } from "../../infrastructure/storage/minio.storage";

@injectable()
export class UploadGeneratedImageUseCase {
    constructor(
        @inject(TOKENS_PICTURE.storage.minioStorage)
        private minioStorage: MinioStorage
    ) { }

    async execute(imageUrl: string) {
        const response = await fetch(imageUrl);

        if (!response.ok) {
            throw new Error(
                `Failed to download generated image: ${response.status}`
            );
        }

        const mimeType = response.headers.get("content-type") || "image/png";

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return await this.minioStorage.upload({
            listingId,
            buffer,
            mimeType,
        });
    }
}