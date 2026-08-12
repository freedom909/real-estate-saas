//src/core/listing/application/usecase/uploadImages.usecase.ts

import { inject, injectable } from "tsyringe";

import { TOKENS_PICTURE } from "@/modules/tokens/picture.tokens";
import { MinioStorage } from "../../infrastructure/storage/minio.storage";


@injectable()
export class UploadImageUseCase {
    /**
     *
     */
    constructor(
      @inject(TOKENS_PICTURE.usecase.uploadImageUseCase)
      private minioStorage:MinioStorage

    ) {}
    async execute(files:any[]){
        const pictures=[]
        for(const file of files){
            const {filename,mimeType,createReadStream}=await file;
            const objectKey= `${Date.now()}-${filename}`;

            await this.minioStorage.upload(file)
            pictures.push({objectKey,filename,mimeType})
        }
        return pictures
    }
}