import { delay, inject, injectable } from "tsyringe";

import { GenerateListingAIOptimizationUseCase } from "@/wisdom/agents/listing/generateListingAIOptimization.usecase";
import CreateListingUseCase from "@/core/listing/application/usecase/createListingUseCase";

@injectable()
export class CreateListingCapability {
  constructor(
    @inject(delay(() => CreateListingUseCase))
    private createListingUseCase: CreateListingUseCase
  ) {}

  async execute(input: any) {
    return this.createListingUseCase.execute(input);
  }
}

@injectable()
export class ActivateCapability {
  async execute(listingId: string) {
    // TODO: Implement activate logic
    return { success: true, listingId };
  }
}

@injectable()
export class DeactivateCapability {
  async execute(listingId: string) {
    // TODO: Implement deactivate logic
    return { success: true, listingId };
  }
}

@injectable()
export class OptimizeListingCapability {
  constructor(
    @inject(delay(() => GenerateListingAIOptimizationUseCase))
    private optimizationUseCase: GenerateListingAIOptimizationUseCase
  ) {}

  async execute(listingId: string) {
    return this.optimizationUseCase.execute(listingId);
  }
}

@injectable()
export class AnalyzeListingCapability {
  async execute(listingId: string) {
    // TODO: Implement analyze logic
    return { success: true, listingId, score: 95 };
  }
}
