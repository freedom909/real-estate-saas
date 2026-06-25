import { ArtifactType } from "../artifact-type.enum";
import { BaseArtifactDTO } from "./base-artifact.dto";

export class DescriptionArtifactDTO extends BaseArtifactDTO {
  public readonly description: string;

  constructor(description: string) {
    super(ArtifactType.DESCRIPTION);
    this.description = description;
  }

  /**
   * Factory method for creating DescriptionArtifactDTO
   */
  public static create(description: string): DescriptionArtifactDTO {
    return new DescriptionArtifactDTO(description);
  }
}