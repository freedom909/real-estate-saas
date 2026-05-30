// getCategoriesByIds.useCase.ts

import { injectable, inject } from "tsyringe";

import { TOKENS_CATEGORY } from "@/modules/tokens/ai/category.tokens";
import { ICategoryRepository } from "../../domain/ICategoryRepository";

@injectable()
class GetCategoriesByIdsUseCase {
  constructor(
    @inject(TOKENS_CATEGORY.CategoryRepository)
    private repo: ICategoryRepository
  ) {}

  async execute(ids: string[]) {
    return this.repo.findByIds(ids);
  }
}

export default GetCategoriesByIdsUseCase;