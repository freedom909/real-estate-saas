
// src/modules/container/picture.register.ts

import { TOKENS_PICTURE } from "../tokens/picture.tokens";
import { container } from "tsyringe";

import { PictureModel } from "@/core/listing/infrastructure/models/picture.model";
import { DeletePictureUseCase } from "@/core/listing/application/usecase/deletePicture.usecase";
import { MinioStorage } from "@/core/listing/infrastructure/storage/minio.storage";
import { PictureRepository } from "@/core/listing/infrastructure/persistence/picture.repository";


export function registerPicture() {
    container.register(TOKENS_PICTURE.repos.pictureRepository, PictureRepository);
    container.register(TOKENS_PICTURE.models.pictureModel, { useValue: PictureModel });
    container.register(TOKENS_PICTURE.usecase.deletePictureUseCase, { useClass: DeletePictureUseCase });
    container.registerSingleton(TOKENS_PICTURE.storage.minioStorage, MinioStorage);
  
}