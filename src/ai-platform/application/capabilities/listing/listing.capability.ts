import { delay, inject, injectable } from "tsyringe";
import { CreateListingUseCase } from "@/core/listing/application/usecase/createListing.usecase";
import { PublishListingUseCase } from "@/core/listing/application/usecase/publishListing.usecase";
import { GenerateListingAIOptimizationUseCase } from "@/ai-platform/application/usecases/listing/generateListingAIOptimization.usecase";

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
  constructor(
    @inject(delay(() => PublishListingUseCase))
    private publishListingUseCase: PublishListingUseCase
  ) {}

  async execute(listingId: string) {
    return this.publishListingUseCase.execute(listingId);
  }
}

@injectable()
export class DeactivateCapability {
  constructor(
    @inject(delay(() => PublishListingUseCase))
    private publishListingUseCase: PublishListingUseCase
  ) {}

  async execute(listingId: string) {
    // Implement deactivate logic
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
    // Implement analyze logic
    return { success: true, listingId, score: 95 };
  }
}
