//src/subgraphs/listing/application/usecase/deletePicture.usecase.ts
import { TOKENS_PICTURE } from '@/modules/tokens/picture.tokens';
import { inject, injectable } from 'tsyringe';
import { MinioStorage } from '../../infrastructure/storage/minio.storage';
import { IPictureRepository } from '../../domain/repositories/picture.repository';


@injectable()
export class DeletePictureUseCase {
  constructor(
    @inject(TOKENS_PICTURE.repos.pictureRepository)
    private readonly pictureRepository: IPictureRepository,
    @inject(TOKENS_PICTURE.storage.minioStorage)
    private readonly storage: MinioStorage,
  ) {}

  async execute(pictureId: string, role: string) {
    if (role !== "HOST" && role !== "ADMIN") {
      throw new Error("User is not allowed to delete a picture");
    }
    const picture = await this.pictureRepository.findById(pictureId);
    if (!picture) {
      throw new Error('Picture not found');
    }
    await this.storage.delete(picture.objectKey);
    await this.pictureRepository.delete(pictureId);
  }
}