import { injectable } from 'tsyringe';
import { BaseArtifactDTO } from './dto/base-artifact.dto';
import { TitleArtifactDTO } from './dto/title-artifact.dto';
import { DescriptionArtifactDTO } from './dto/description-artifact.dto';
import { SEOArtifactDTO } from './dto/seo-artifact.dto';
import { TipsArtifactDTO } from './dto/tips-artifact.dto';

export interface AIResponsePayload {
  title: string;
  description: string;
  seo: string[];
  tips: string[];
}

@injectable()
export class ArtifactFactory {
  /**
   * Converts raw parsed AI JSON into an array of typed Artifact DTOs.
   * Ensures strict type safety and domain-compliant structures.
   */
  public createFromAIResponse(payload: AIResponsePayload): BaseArtifactDTO[] {
    const artifacts: BaseArtifactDTO[] = [];

    if (payload.title) {
      artifacts.push(TitleArtifactDTO.create(payload.title));
    }

    if (payload.description) {
      artifacts.push(DescriptionArtifactDTO.create(payload.description));
    }

    if (payload.seo && Array.isArray(payload.seo)) {
      artifacts.push(SEOArtifactDTO.create(payload.seo));
    }

    if (payload.tips && Array.isArray(payload.tips)) {
      artifacts.push(TipsArtifactDTO.create(payload.tips));
    }

    return artifacts;
  }
}