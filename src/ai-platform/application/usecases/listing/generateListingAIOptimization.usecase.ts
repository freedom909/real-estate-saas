//src/ai-platfrom/application/usecases/generateListingAIOptimization.usecase.ts
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { inject, injectable } from "tsyringe";

import { TOKENS_AI } from "@/modules/tokens/ai.tokens";

import { ArtifactType } from "@/ai-platform/context/types/context/agent.result";
import { AIDomain } from "@/ai-platform/domain/semantic/types/ai.domain";


import { v4 as uuidv4 } from "uuid";
import { IListingRepository } from "@/core/listing/domain/entities/IListingRepository";
import { ILLMProvider } from "@/ai-platform/domain/interface/ILLMProvider";
import { IListingAISuggestionRepository } from "@/core/listing/domain/entities/IListingAISuggestionRepository";
import { listingOptimizationPrompt } from "@/core/listing/application/usecase/prompts/listing.prompt";
import { ListingAISuggestion } from "@/core/listing/domain/entities/listingAI.suggestion";
import { TOKENS } from "@/shared/infra/tokens";
import { TOKENS_CACHE } from "@/modules/tokens/cache.token";
import RedisService from "@/infrastructure/redis/redisService";


@injectable()
export class GenerateListingAIOptimizationUseCase {

  constructor(
    @inject(TOKENS_LISTING.repos.listingRepository)
    private repo: IListingRepository,

    @inject(TOKENS_AI.usecase.llmProvider)
    private ai: ILLMProvider,

    @inject(TOKENS_AI.repos.listingAISuggestionRepository)
    private aiSuggestionRepo: IListingAISuggestionRepository,

    // インフラ層で定義されているキャッシュサービスを注入
    @inject(TOKENS_CACHE.service.cacheService) 
    private cacheService: RedisService,
  ) {}

  async execute(listingId: string) {
    const cacheKey = `listing_opt:${listingId}`;

    // 1. Redis キャッシュのチェック
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // 2. リポジトリからリスティングを取得
    const listing = await this.repo.findById(listingId);
    if (!listing) throw new Error("Listing not found");

    // 3. AI プロンプトの生成と実行
    const promptString = listingOptimizationPrompt({
      title: listing.title,
      description: listing.description,
      address: listing.address,
      categories: listing.categories,
      amenities: listing.amenityIds,
    });

    const response = await this.ai.generateText({ prompt: promptString });
    
    const raw = typeof response === 'string' ? response : JSON.stringify(response);

    const cleaned = raw.replace(/```json/g, "").replace(/```/g, "");

    const parsed = JSON.parse(cleaned);

    const result = {
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
          content: { keywords: parsed.seo }
        },
        {
          type: ArtifactType.TIPS,
          content: { tips: parsed.tips }
        }
      ]
    };

    // 4. キャッシュへの書き込み（1日有効）
    await this.cacheService.set(cacheKey, JSON.stringify(result));

    // 5. データベースへの保存（DDD: 提案エンティティを作成して専用リポジトリに保存）
const suggestion =
  ListingAISuggestion.create({
    title: parsed.title,
    description: parsed.description,
    seo: parsed.seo,
    tips: parsed.tips,
  });

    await this.aiSuggestionRepo.save(suggestion);

    return result;
  }
}