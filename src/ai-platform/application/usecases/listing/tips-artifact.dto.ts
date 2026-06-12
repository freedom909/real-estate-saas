import { ArtifactType } from './artifact-type.enum';
import { BaseArtifactDTO } from './base-artifact.dto';

export class TipsArtifactDTO extends BaseArtifactDTO {
  public readonly tips: readonly string[];

  constructor(tips: string[]) {
    super(ArtifactType.TIPS);
    this.tips = Object.freeze([...tips]);
  }

  /**
   * Factory method for creating TipsArtifactDTO
   */
  public static create(tips: string[]): TipsArtifactDTO {
    return new TipsArtifactDTO(tips);
  }
}