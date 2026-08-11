//src/core/listing/application/usecase/uploadImages.usecase.ts

import { inject, injectable } from "tsyringe";
import { MinioService } from "@/core/listing/infrastructure/persistence/minio.service";
import { TOKENS_PICTURE } from "@/modules/tokens/picture.tokens";


@injectable()
export class UploadImageUseCase {
    /**
     *
     */
    constructor(
      @inject(TOKENS_PICTURE.usecase.uploadImageUseCase)
      private minioService:MinioService

    ) {}
    async execute(files:any[]){
        const pictures=[]
        for(const file of files){
            const {filename,mimeType,createReadStream}=await file;
            const objectKey= `${Date.now()}-${filename}`;

            await this.minioService.upload(objectKey,createReadStream(),mimeType)
            pictures.push({objectKey,filename,mimeType})
        }
        return pictures
    }
}