import { ArtifactType } from '../artifact-type.enum';
import { BaseArtifactDTO } from './base-artifact.dto';

export class TitleArtifactDTO extends BaseArtifactDTO {
  public readonly title: string;

  constructor(title: string) {
    super(ArtifactType.TITLE);
    this.title = title;
  }

  /**
   * Factory method for creating TitleArtifactDTO
   */
  public static create(title: string): TitleArtifactDTO {
    return new TitleArtifactDTO(title);
  }
}