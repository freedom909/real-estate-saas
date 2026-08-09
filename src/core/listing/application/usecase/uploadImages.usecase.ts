import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { TOKENS_STORAGE } from "@/modules/tokens/storage.tokens";
import { inject, injectable } from "tsyringe";
import { MinioService } from "@/core/listing/infrastructure/persistence/minio.service";


@injectable()
export class UploadImageUseCase {
    /**
     *
     */
    constructor(
      @inject(TOKENS_STORAGE.uploadImage)
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