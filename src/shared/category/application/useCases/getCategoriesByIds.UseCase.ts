// getCategoriesByIds.useCase.ts

import { injectable, inject } from "tsyringe";

import { TOKENS_CATEGORY } from "@/modules/tokens/category.tokens";
import { ICategoryRepository } from "../../domain/ICategory.repository";

@injectable()
class GetCategoriesByIdsUseCase {
  constructor(
    @inject(TOKENS_CATEGORY.categoryRepository)
    private repo: ICategoryRepository
  ) {}

  async execute(ids: string[]) {
    return this.repo.findByIds(ids);
  }
}

export default GetCategoriesByIdsUseCase;