// ListingOptimizationAgent.ts

import { inject, injectable } from "tsyringe";

import { CategoryOptimizationTool } from "../tools/categoryOptimizationTool";
import { GenerateSEOKeywordsTool } from "../tools/generateSEOKeywordsTool";
import { PriceOptimizationTool } from "../tools/priceOptimizationTool";
import { RewriteDescriptionTool } from "../tools/rewriteDescriptionTool";

import { ListingAIContext } from "@/subgraphs/listing/domain/entities/listingAIContext";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { AnalyzeListingTool } from "../tools/AnalyzeListingTool";
import { RewriteTitleTool } from "../tools/rewriteTitleTool";

@injectable()
export class ListingOptimizationAgent {
  constructor(
    @inject(TOKENS_AI.tool.analyzeListingTool)
    private analyzeTool: AnalyzeListingTool,

    @inject(TOKENS_AI.tool.generateSEOKeywordsTool)
    private seoTool: GenerateSEOKeywordsTool,

    @inject(TOKENS_AI.tool.rewriteTitleTool)
    private rewriteTitleTool: RewriteTitleTool,

    @inject(TOKENS_AI.tool.rewriteDescriptionTool)
    private rewriteDescriptionTool: RewriteDescriptionTool,

    @inject(TOKENS_AI.tool.priceOptimizationTool)
    private priceOptimizationTool: PriceOptimizationTool,

    @inject(TOKENS_AI.tool.categoryOptimizationTool)
    private categoryOptimizationTool: CategoryOptimizationTool,
  ) {}

  async execute(context: ListingAIContext) {

    // STEP 1 — ANALYSIS
    const analysis =
      await this.analyzeTool.execute(context);

    // STEP 2 — SEO
    let seoKeywords: string[] = [];

    if (
      analysis.problems.includes(
        "description lacks keywords"
      )
    ) {
      seoKeywords =
        await this.seoTool.execute({
          ...context,
          analysis,
        });
    }

    const keywordText =
      seoKeywords.join(", ");

    // STEP 3 — TITLE
    const title =
      await this.rewriteTitleTool.execute({
        ...context,
        analysis,
        seoKeywords,
      });

    // STEP 4 — DESCRIPTION
    const description =
      await this.rewriteDescriptionTool.execute({
        ...context,
        analysis,
        seoKeywords,
        title,
      });

    // STEP 5 — PRICE
    const pricing =
      await this.priceOptimizationTool.execute({
        ...context,
        analysis,
      });

    // STEP 6 — CATEGORY
    const category =
      await this.categoryOptimizationTool.execute({
        ...context,
        analysis,
        title,
        description,
        price:pricing,
        seoKeywords,
      });

    return {
      analysis,
      seoKeywords,
      title,
      description,
      category,
      pricing,
    };
  }
}