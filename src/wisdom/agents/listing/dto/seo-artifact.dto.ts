import { ArtifactType } from '../../../../wisdom/agents/listing/artifact-type.enum';
import { BaseArtifactDTO } from './base-artifact.dto';

export class SEOArtifactDTO extends BaseArtifactDTO {
  public readonly keywords: readonly string[];

  constructor(keywords: string[]) {
    super(ArtifactType.SEO);
    this.keywords = Object.freeze([...keywords]);
  }

  /**
   * Factory method for creating SEOArtifactDTO
   */
  public static create(keywords: string[]): SEOArtifactDTO {
    return new SEOArtifactDTO(keywords);
  }
}