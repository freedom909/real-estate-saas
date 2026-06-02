// //src/subgraphs/listing/application/use-cases/GenerateListingSuggestionsUseCase.ts
// import { injectable, inject } from "tsyringe";
// import { ILLMService } from "@/subgraphs/listing/application/ai/services/openAIService";
// import { listingOptimizationPrompt } from "@/subgraphs/listing/application/ai/prompts/listing.prompt";
// import { IListingRepository } from "../../domain/entities/IListingRepository";
// import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
// import { TOKENS_AI } from "@/modules/tokens/ai.tokens";

// @injectable()
// export class GenerateListingSuggestionsUseCase {
//   constructor(
//     @inject(TOKENS_AI.OpenAIService)
//     private ai: ILLMService,

//     @inject(TOKENS_LISTING.ListingRepository)
//     private repo: IListingRepository
//   ) {}

//   async execute(listingId: string){
//     const listing = await this.repo.findById(listingId);

//     if (!listing) {
//       throw new Error("Listing not found");
//     }
   

//     if (!listing) {
//       throw new Error("Listing not found");
//     }

//     const prompt = listingOptimizationPrompt(
//       listing.title,
//       listing.description
//     );

//     return this.ai.generate(prompt);
//   }
// }