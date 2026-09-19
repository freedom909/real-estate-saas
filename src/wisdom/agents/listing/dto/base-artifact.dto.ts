import { ArtifactType } from "@/wisdom/shared/enums/artifact-type.enum";


export abstract class BaseArtifactDTO {
  constructor(
    public readonly type: ArtifactType
  ) {}
}