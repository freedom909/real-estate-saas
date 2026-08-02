import { injectable, inject } from 'tsyringe';
import { Picture } from '../../domain/entities/picture';
import { PictureRepository } from '../../infrastructure/persistence/picture.repository';
import { TOKENS_PICTURE } from '@/modules/tokens/picture.tokens';

export interface UpdatePictureProps {
  id: string;
  listingId: string;
  url: string;
  type: string;
  sortOrder: number;
}

@injectable()
export default class UpdatePictureUseCase {
  constructor(
    @inject(TOKENS_PICTURE.repos.pictureRepository)
    private pictureRepository: PictureRepository,
  ) {}

  async execute(id: string, input: UpdatePictureProps) {
    const existing = await this.pictureRepository.findById(id);
    if (!existing) {
      throw new Error(`Picture not found: ${id}`);
    }

    const updated = new Picture(existing.toJson());
    await this.pictureRepository.save(updated); 
    return updated;
  }
}
