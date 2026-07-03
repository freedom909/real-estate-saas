
import { inject, injectable } from "tsyringe";
import { WISDOM_TOKENS } from "../../container/tokens/wisdom.tokens";
import { WisdomPipelineContext } from "../wisdomPipeline.context";
import { ISemanticExtractor } from "../../contracts/semantic-extractor";
import { IPipelineStage } from "./i-pipeline-stage";

@injectable()
export class SemanticStage implements IPipelineStage {
  constructor(
    @inject(WISDOM_TOKENS.semanticExtractor)
    private extractor: ISemanticExtractor
  ) {}

  async execute(ctx: WisdomPipelineContext) {
    
    console.log("before SemanticStage execute++", ctx.request);//no output
    ctx.semantic = await this.extractor.extract(ctx.request);
    console.log("after SemanticStage execute++", ctx.semantic);//no output
    return ctx;
  }
}