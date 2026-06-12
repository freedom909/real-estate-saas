import { ArtifactType } from './artifact-type.enum';

export abstract class BaseArtifactDTO {
  constructor(
    public readonly type: ArtifactType
  ) {}
}