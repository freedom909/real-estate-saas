import { injectable, inject } from 'tsyringe';
import { Picture } from '../../domain/entities/picture';
import { PictureRepository } from '../../infrastructure/persistence/picture.repository';
import { TOKENS_PICTURE } from '@/modules/tokens/picture.tokens';
import { UploadImageUseCase } from './uploadImages.usecase';
import { MinioStorage } from '../../infrastructure/storage/minio.storage';
import { randomUUID } from 'crypto';

export interface UpdatePictureInput {
  listingId: string;

  buffer: Buffer;

  mimeType: string;

  type: string;

  sortOrder?: number;
}

@injectable()
export default class UpdatePictureUseCase {
  constructor(
    @inject(TOKENS_PICTURE.repos.pictureRepository)
    private readonly pictureRepository: PictureRepository,
    @inject(TOKENS_PICTURE.usecase.uploadImageUseCase)
    private readonly storage: MinioStorage,
  ) {}

  async execute(input: UpdatePictureInput): Promise<Picture> {
 // 1. Upload file to MinIO
    const stored =
      await this.storage.upload({

        listingId:
          input.listingId,

        buffer:
          input.buffer,

        mimeType:
          input.mimeType,
      });

    // 2. Create domain entity
    const picture =
      new Picture({

        id:
          randomUUID(),

        listingId:
          input.listingId,

        objectKey:
          stored.objectKey,

        mimeType:
          stored.mimeType,

        size:
          stored.size,

        type:
          input.type,

        sortOrder:
          input.sortOrder ?? 0,
      });

    // 3. Save metadata to DB
    try {

      return await this.pictureRepository.create(
        picture
      );

    } catch (error) {

      // DB failed → remove orphan file
      await this.storage.delete(
        stored.objectKey
      );

      throw error;
    }
  }
}
