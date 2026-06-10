import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { inject, injectable } from "tsyringe";
import { IListingRepository } from "../../domain/entities/IListingRepository";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { IOpenAIAdapter } from "../../domain/entities/IOpenAIAdapter";
import { ArtifactType } from "@/ai-platform/context/types/context/agent.result";
import { AIDomain } from "@/ai-platform/domain/semantic/types/ai.domain";

@injectable()
export class GenerateListingAIOptimizationUseCase {

  constructor(
    @inject(TOKENS_LISTING.repos.listingRepository)
    private repo: IListingRepository,

    @inject(TOKENS_AI.OpenAIAdapter)
    private ai: IOpenAIAdapter,
  ) {}

  async execute(listingId: string) {

    const listing = await this.repo.findById(listingId);
    if (!listing) throw new Error("Listing not found");

  
const prompt = `
You are an AI listing optimization engine.

Return ONLY valid JSON.

Rules:
- No markdown
- No explanations
- No comments
- Use double quotes only
- No trailing commas
- Output must be valid JSON.parse() format

Return EXACTLY this schema:

{
  "title": "string",
  "description": "string",
  "seo": ["string"],
  "tips": ["string"]
}

Listing:

Title:
${listing.title}

Description:
${listing.description}

Categories:
${listing.categories.join(", ")}

Amenities:
${listing.amenityIds.join(", ")}
`;


    const response = await this.ai.generateText({ prompt });
    const raw = typeof response === 'string' ? response : JSON.stringify(response);

    const cleaned = raw.replace(/```json/g, "").replace(/```/g, "");

    const parsed = JSON.parse(cleaned);

    return {
      success: true,
      domain: AIDomain.LISTING,
      primaryAction: {
        name: "OPTIMIZE_ALL",
        confidence: 1.0
      },
      summary: "Listing AI optimization completed",
      artifacts: [
        {
          type: ArtifactType.TITLE,
          content: { title: parsed.title }
        },
        {
          type: ArtifactType.DESCRIPTION,
          content: { description: parsed.description }
        },
        {
          type: ArtifactType.SEO,
          content: { keywords: parsed.seoKeywords }
        },
        {
          type: ArtifactType.TIPS,
          content: { tips: parsed.tips }
        }
      ]
    };
  }
}